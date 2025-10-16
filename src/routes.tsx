import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Plans from "./pages/Plans";
import Payment from "./pages/Payment";
import Resume from "./pages/Resume";

const MyRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/plano" element={<Plans />} />
                <Route path="/pagamento" element={<Payment />} />
            </Routes>
        </Router>
    )
}

export default MyRoutes;