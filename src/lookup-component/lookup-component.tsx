import React, {SyntheticEvent} from "react";
import {OpenCovidService} from "./service";
import {CenterBigSpinnerComponent} from "../common-components/spinner";

class LookupComponentProps {
}

class LookupComponentState {
    error: Error | null = null;
    isLoaded: boolean = false;
    simpleData: string = "";
}

export class LookupComponent extends React.Component<any, LookupComponentState>{
    constructor(props: any) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            simpleData: ""
        }

        // bind submit
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event: SyntheticEvent) {

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
            })
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
        console.log(this.state.simpleData)

        return <div>
            {errorMsg}
            {spinner}
            <div>{data}</div>
            This is the lookup component
        </div>
    }


}
