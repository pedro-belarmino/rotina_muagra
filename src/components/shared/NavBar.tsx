import {
    BottomNavigation, BottomNavigationAction, Box,
    // Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import HomeIcon from '@mui/icons-material/Home';
import AddBoxIcon from '@mui/icons-material/AddBox';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from "react-router-dom";
import AssessmentIcon from '@mui/icons-material/Assessment';

// import ShareIcon from '@mui/icons-material/Share';



// import { useAuth } from "../../context/AuthContext";
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';


export default function NavBar() {

    // const { user } = useAuth();
    const navigate = useNavigate()
    const [value, setValue] = useState(0);


    useEffect(() => {
        if (location.pathname === "/home") {
            setValue(0);
        } else if (location.pathname === "/criar-tarefa") {
            setValue(1);
        } else if (location.pathname === "/historico") {
            setValue(2);
        } else if (location.pathname === "/relatorio") {
            setValue(3);
        }
    }, [location.pathname]);

    return (
        <Box sx={{ width: 'full', }}>
            <BottomNavigation

                showLabels
                value={value}
                onChange={(_event, newValue) => {
                    setValue(newValue);
                }}
            >
                <BottomNavigationAction label="Home" icon={<HomeIcon />} onClick={() => navigate('/home')} sx={{ '&.Mui-selected': { color: 'warning.main' } }} />
                <BottomNavigationAction label="Criar" icon={<AddBoxIcon />} onClick={() => navigate('/criar-tarefa')} sx={{ '&.Mui-selected': { color: 'warning.main' } }} />
                <BottomNavigationAction label="Historico" icon={<HistoryIcon />} onClick={() => navigate('/historico')} sx={{ '&.Mui-selected': { color: 'warning.main' } }} />
                <BottomNavigationAction label="Relatório" icon={<AssessmentIcon />} onClick={() => navigate('/relatorio')} sx={{ '&.Mui-selected': { color: 'warning.main' } }} />
                <BottomNavigationAction label="Sair" icon={<LogoutRoundedIcon />} onClick={() => navigate('/')} sx={{ '&.Mui-selected': { color: 'warning.main' } }} />
            </BottomNavigation>
        </Box>
    )
}