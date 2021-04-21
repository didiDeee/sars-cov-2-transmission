import React, {SyntheticEvent, useState} from "react";
import {OpenCovidService} from "./service";
import {CenterBigSpinnerComponent} from "../common-components/spinner";
import DatePicker from "react-datepicker";
import moment from "moment";

import "react-datepicker/dist/react-datepicker.css";


class LookupComponentProps {
}

class LookupComponentState {
    error: Error | null = null;
    isLoaded: boolean = false;
    simpleData: string = "";
    longitude: string = "";
    latitude: string = "";
    healthUnit: string = "";
    pickedDate: Date = moment().toDate();
    populationMap: Map<any, any> = new Map();
    percentage: string = "";

}

export class LookupComponent extends React.Component<any, LookupComponentState>{
    constructor(props: any) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            simpleData: "",
            longitude: "",
            latitude: "",
            healthUnit: "",
            pickedDate: moment().toDate(),
            populationMap: new Map<any, any>(),
            percentage: ""
        }

        // bind submit
        this.onDatePick = this.onDatePick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    findLocation (location: string):string {
        // this.state.populationMap.forEach((value: any, key: string) => {
        //     // console.log(key)
        // })
        for (let entry of Array.from(this.state.populationMap.entries())) {
            let key = entry[0]
            if (key.includes(location)) {
                return key;
            }
        }
        return "";
    }

    handleSubmit(event: SyntheticEvent) {
        this.setState({
            isLoaded: false,
            error: null
        });

        let date = moment(this.state.pickedDate);
        // let healthUnit = parseInt(this.state.healthUnit);

        // try to match location first
        OpenCovidService.getLocationData(this.state.latitude, this.state.longitude)
            .then((results:string[]) => {
                console.log(results)
                let found = false;
                let locationKey:string = ""
                for (let i = 0; i < results.length; i++){
                    let r: string = results[i];
                    locationKey = this.findLocation(r);
                    if (locationKey.length > 0) {
                        found = true;
                        let total = this.state.populationMap.get(locationKey).pop
                        let healthUnit = this.state.populationMap.get(locationKey).id
                        // if match, then get the other info
                        OpenCovidService.getCasesByDayAndHealthUnit(date, healthUnit)
                            .then((cases: number) => {
                                this.setState({
                                    percentage: (cases / total * 0.32 * 100).toFixed(4).toString() + "%",
                                    longitude: this.state.longitude,
                                    latitude: this.state.latitude,
                                    error: null,
                                    isLoaded: true
                                })
                            })
                        break;
                    }
                }

                // if we can't find location
                if (!found) {
                    this.setState({
                        error: new Error("cannot find location, try using the health code instead"),
                        isLoaded: true,
                        percentage: "cannot find location, try using the health code instead"
                    })
                }
            });
    }

    componentDidMount() {
        OpenCovidService.getSimpleInfo()
            .then((loadedData: string) => {
                this.setState({
                    error: null,
                    isLoaded: true,
                    simpleData: loadedData
                })
            }, (error) => {
                this.setState({error: error})
            });

        OpenCovidService.getCodesAndPopulations()
            .then((map: Map<any, any>) => {
                this.setState({populationMap: map})
                console.log(map)
            })

    }

    onDatePick(date: Date | [Date, Date] | null) {
        console.log(date)
        if (!date) {
            this.setState({pickedDate: moment().toDate()})
        }
        else if (Array.isArray(date)) {
            this.setState({pickedDate: date[0]})
        } else {
            this.setState({pickedDate: date})
        }
    }

    render() {
        // used to test
        if (!this.state.isLoaded) {
            return <CenterBigSpinnerComponent />
        }

        let errorMsg = <div/>;
        let spinner = <div/>
        if (this.state.error) {
            errorMsg = <div>Unexpected Error, please try again later</div>
        }

        let data:string = this.state.simpleData;


        return <div className={"lookup"}>
            {errorMsg}
            {spinner}
            <form onSubmit={this.handleSubmit}>
                <div className={"form-group"}>
                    <label>Date</label>
                    {/*<DatePicker selected={startDate} onChange={date => setStartDate(date)} />*/}
                    <DatePicker selected={this.state.pickedDate}
                                onChange={this.onDatePick}/>
                </div>
                <div className={"form-group"}>
                    <label>Location</label>
                    <input type="number"
                           step="0.0000001"
                           className="form-control"
                           id="lattitude"
                           placeholder="lattitude"
                           onChange={(event) => this.setState({latitude: event.target.value})}/>
                    <input type="number"
                           step="0.0000001"
                           className="form-control"
                           id="longitutde"
                           placeholder="longitutde"
                           onChange={(event) => {this.setState({longitude: event.target.value})}}/>
                    <input type="text"
                           className="form-control"
                           id="user-name-owner"
                           placeholder="health unit code"
                           onChange={event => this.setState({healthUnit: event.target.value})}/>
                    <button type="submit" className="btn btn-primary">
                        Search
                    </button>

                </div>
            </form>

            <div>percentage: {this.state.percentage}</div>
        </div>
    }


}