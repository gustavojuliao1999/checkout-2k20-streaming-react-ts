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
                <Route path="/selecione-plano" element={<Plans />} />
                <Route path="/dados-pagamento" element={<Payment />} />
                <Route path="/resumo" element={<Resume/>}/>
            </Routes>
        </Router>
    )
}

export default MyRoutes;