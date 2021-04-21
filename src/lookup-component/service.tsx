import {Moment} from "moment";

const API_KEY:string = "AIzaSyBL3Obbx4Z6ziRQpgMq0Sy3QeQa-HYON7Y";

function jsonParseSafe(text: string): any {
    if (null == text || "" == text) {
        return {};
    }
    try {
        return JSON.parse(text);
    } catch (e) {
        return {};
    }
}

function parseResponse(response: any) {
    if (response.status === 500) return Promise.resolve({});
    return response.text().then(jsonParseSafe);
}

export class OpenCovidService {
    static getSimpleInfo = (): Promise<string> => {

        return new Promise(((resolve: (result: string) => void, reject: (error: Error) => void) => {
            fetch("https://api.opencovid.ca/summary")
                .then((response) => {
                    console.log(response)
                    response.text().then(resolve)
                })
                .catch((error) => {
                    reject(error)
                })
        }));
    }

    static getCasesByDayAndHealthUnit = (date: Moment, healthUnit: number): Promise<number> => {
        let dateString = date.format('YYYY-MM-DD');
        let queryUrl = "https://api.opencovid.ca/summary?" +
            "stat=cases&before=" + dateString +
            "&after=" + dateString +
            "&loc=" + healthUnit
        return new Promise(((resolve: (result: number) => void, reject: (error: Error) => void) => {
            fetch(queryUrl)
                .then((response) => {
                    parseResponse(response).then((data: any) => {
                        console.log(data)
                        let summary = data.summary[0];
                        resolve(summary.cases);
                    })
                })
                .catch((error) => {
                    reject(error)
                })
        }));
    }

    static getTotalPopulationByHealthUnit = (healthUnit: number): Promise<number> => {
        let queryUrl = "https://api.opencovid.ca/other?stat=hr"
        return new Promise(((resolve: (result: number) => void, reject: (error: Error) => void) => {
            fetch(queryUrl)
                .then((response) => {
                    parseResponse(response).then((data:any) => {
                        let hrData = data.hr;
                        hrData.forEach((unit: any) => {
                            if (unit.HR_UID == healthUnit) {
                                resolve(unit.pop)
                            }
                        })
                        resolve(-1)
                    })
                })
                .catch((error) => {
                    reject(error)
                })
        }));
    }

    static getCodesAndPopulations = (): Promise<Map<any, any>> => {
        let queryUrl = "https://api.opencovid.ca/other?stat=hr"

        return new Promise((resolve: (result: Map<any, any>) => void, reject: (error: Error) => void) => {
            fetch(queryUrl)
                .then((response) => {
                    parseResponse(response).then((data:any) => {
                        let hrData = data.hr;
                        let dict = new Map()
                        hrData.forEach((unit: any) => {
                            dict.set(unit.province + "|" + unit.health_region, {id: unit.HR_UID, pop: unit.pop})
                        })
                        resolve(dict)
                    })
                })
                .catch((error) => {
                    reject(error)
                })
        });
    }

    static getLocationData = (latitude: string, longitude: string): Promise<string[]> => {
        let queryUrl = "https://maps.googleapis.com/maps/api/geocode/json?" +
            "latlng="+ latitude + "," + longitude +
            "&sensor=true" +
            "&key=" + API_KEY

        return new Promise((resolve: (result: string[]) => void) => {
            fetch(queryUrl)
                .then((response) => {
                    parseResponse(response).then((data:any) => {
                        let topHits = data.results[0].address_components
                        let matches:string[] = [];
                        topHits.forEach((hit:any) => {
                            matches.push(hit.short_name)
                        })
                        resolve(matches);
                    })
                })
        })
    }
}
