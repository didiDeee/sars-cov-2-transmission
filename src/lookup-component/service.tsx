import {Simulate} from "react-dom/test-utils";

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
}
