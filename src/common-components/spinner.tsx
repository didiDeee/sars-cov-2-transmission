import * as React from "react";

export class CenterBigSpinnerComponent extends React.Component {
    render() {
        return <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
            </div>
        </div>;
    }
}
