import { Box, } from "@mui/material";
import DailyTasks from "../components/DailyTasks/DailyTasks";
import PhoneNumberModal from "../components/PhoneNumberModal/PhoneNumberModal";

export default function Home() {
    return (
        <Box>
            <PhoneNumberModal />
            <DailyTasks />
        </Box>
    )
}
