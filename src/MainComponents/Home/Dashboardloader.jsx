import { ProgressSpinner } from "primereact/progressspinner";
import "./DashboardLoader.css";

const DashboardLoader = () => {
    return (
        <div className="dashboard-loader">
            {/* Decorative background blobs */}
            <span className="blob blob-1"></span>
            <span className="blob blob-2"></span>
            <span className="blob blob-3"></span>

            {/* Loader Content */}
            <div className="loader-content">
                <ProgressSpinner
                    style={{ width: "70px", height: "70px" }}
                    strokeWidth="3"
                    animationDuration=".8s"
                />

                <div className="loader-text">
                    <h3>Loading Dashboard</h3>
                    <p>Fetching latest insights…</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardLoader;
