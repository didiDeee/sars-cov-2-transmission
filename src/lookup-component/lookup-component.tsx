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

    handleSubmit(event: SyntheticEvent) {
        this.setState({
            isLoaded: false,
            error: null
        });

        let date = moment(this.state.pickedDate);
        let healthUnit = parseInt(this.state.healthUnit);
        OpenCovidService.getCasesByDayAndHealthUnit(date, healthUnit)
            .then((cases: number) => {
                OpenCovidService.getTotalPopulationByHealthUnit(healthUnit)
                    .then((total : number) => {
                        alert(cases)
                        alert(total)
                        this.setState({
                            percentage: (cases / total * 0.32 * 100).toString(),
                            error: null,
                            isLoaded: true
                        })
                    })
            })
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


        return <div>
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
                           className="form-control"
                           id="longitutde"
                           placeholder="longitutde"
                           onChange={(event) => {this.setState({longitude: event.target.value})}}/>
                    <input type="number"
                           className="form-control"
                           id="lattitude"
                           placeholder="lattitude"
                           onChange={(event) => this.setState({latitude: event.target.value})}/>
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
            This is the lookup component
        </div>
    }


}
