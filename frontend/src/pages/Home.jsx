import "../App.css";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";

function Home() {
    return (
        <div className="home-container">
            {/* Green header with rounded corners */}
            <div className="welcome-box">
                <h1 className="welcome-title">Smart Energy Saving</h1>
                <p className="welcome-subtitle">Let's start saving power!</p>
            </div>

            {/* Steps container */}
            <div className="steps-container">
                {/* Step 1 - Onboard Device */}
                <div className="step-card">
                    <div className="step-icon">
                        <LibraryAddIcon sx={{ fontSize: 60, color: "#235c23" }} />
                    </div>
                    <h2 className="step-title">Onboard Device</h2>
                    <p className="step-description">
                        Onboard the hardware with all the details.
                    </p>
                </div>

                {/* Step 2 - Schedule */}
                <div className="step-card">
                    <div className="step-icon">
                        <EventRepeatIcon sx={{ fontSize: 60, color: "#235c23" }} />
                    </div>
                    <h2 className="step-title">Schedule</h2>
                    <p className="step-description">
                        Customize your own power on/off times.
                    </p>
                </div>

                {/* Step 3 - Save Energy */}
                <div className="step-card">
                    <div className="step-icon">
                        <EnergySavingsLeafIcon sx={{ fontSize: 60, color: "#235c23" }} />
                    </div>
                    <h2 className="step-title">Save Energy</h2>
                    <p className="step-description">
                        Onboard, schedule and save power!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Home;