import {
    BottomNavigation, BottomNavigationAction, Box,
    // Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import HomeIcon from '@mui/icons-material/Home';
import AddBoxIcon from '@mui/icons-material/AddBox';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useNavigate } from "react-router-dom";
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
        }
    }, [location.pathname]);

    return (
        <Box sx={{ width: 'full', }}>
            <Box sx={{ width: 'full', display: 'flex', placeContent: 'end', pr: 2, placeItems: 'center' }}>
                {/* <Typography sx={{ p: 2 }}>{user?.displayName}</Typography> */}
                <div><LogoutRoundedIcon /></div>
            </Box>
            <BottomNavigation

                showLabels
                value={value}
                onChange={(_event, newValue) => {
                    setValue(newValue);
                }}
            >
                <BottomNavigationAction label="Home" icon={<HomeIcon />} onClick={() => navigate('/home')} sx={{ '&.Mui-selected': { color: 'warning.main' } }} />
                <BottomNavigationAction label="Criar" icon={<AddBoxIcon />} onClick={() => navigate('/criar-tarefa')} sx={{ '&.Mui-selected': { color: 'warning.main' } }} />
                <BottomNavigationAction label="Historico" icon={<TimelineIcon />} onClick={() => navigate('/historico')} sx={{ '&.Mui-selected': { color: 'warning.main' } }} />
            </BottomNavigation>
        </Box>
    )
}