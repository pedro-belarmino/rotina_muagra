import { useEffect, useState, useMemo } from "react";
import {
    Box,
    Typography,
    Container,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    Chip,
    CircularProgress,
    ToggleButton,
    ToggleButtonGroup
} from "@mui/material";
import { getAllUsersWithAccessLevel } from "../service/userService";
import type { AppUser } from "../types/User";
import { useAuth } from "../context/AuthContext";
import AccessDenied from "./AccessDenied";
import dayjs from "dayjs";

export default function Dashboard() {
    const { user } = useAuth();
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'full' | 'partial'>('all');

    const authorizedDashboardEmails = [
        "fabiomarcheriserrano@gmail.com",
        "pedro.gbelarmino@gmail.com"
    ];

    const isDashboardAuthorized = user?.email && authorizedDashboardEmails.includes(user.email.toLowerCase());

    useEffect(() => {
        if (isDashboardAuthorized) {
            const fetchUsers = async () => {
                try {
                    const data = await getAllUsersWithAccessLevel();
                    setUsers(data);
                } catch (error) {
                    console.error("Error fetching users:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [isDashboardAuthorized]);

    const filteredUsers = useMemo(() => {
        if (filter === 'all') return users;
        return users.filter(u => u.accessLevel === filter);
    }, [users, filter]);

    if (!isDashboardAuthorized) {
        return <AccessDenied />;
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                Dashboard de Usuários
            </Typography>

            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h6">
                    Total de Usuários: {users.length}
                </Typography>
            </Box>

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={(_e, newFilter) => newFilter && setFilter(newFilter)}
                    aria-label="filtro de acesso"
                >
                    <ToggleButton value="all" aria-label="todos">
                        Todos
                    </ToggleButton>
                    <ToggleButton value="full" aria-label="acesso completo">
                        Acesso Completo
                    </ToggleButton>
                    <ToggleButton value="partial" aria-label="acesso parcial">
                        Acesso Parcial
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <List sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                {filteredUsers.map((appUser, index) => (
                    <Box key={appUser.uid}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar alt={appUser.displayName || 'User'} src={appUser.photoURL || undefined} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Typography variant="subtitle1" component="span">
                                            {appUser.displayName || "Sem nome"}
                                        </Typography>
                                        <Box>
                                            {appUser.accessLevel === 'full' && (
                                                <Chip label="Completo" color="success" size="small" sx={{ mr: 1 }} />
                                            )}
                                            {appUser.accessLevel === 'partial' && (
                                                <Chip label="Parcial" color="primary" size="small" sx={{ mr: 1 }} />
                                            )}
                                            {appUser.accessLevel === 'none' && (
                                                <Chip label="Nenhum" variant="outlined" size="small" sx={{ mr: 1 }} />
                                            )}
                                        </Box>
                                    </Box>
                                }
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            {appUser.email}
                                        </Typography>
                                        <br />
                                        {"Cadastrado em: " + (appUser.createdAt ? dayjs(appUser.createdAt.toDate()).format('DD/MM/YYYY HH:mm') : 'N/A')}
                                    </>
                                }
                            />
                        </ListItem>
                        {index < filteredUsers.length - 1 && <Divider variant="inset" component="li" />}
                    </Box>
                ))}
                {filteredUsers.length === 0 && (
                    <ListItem>
                        <ListItemText primary="Nenhum usuário encontrado com este filtro." />
                    </ListItem>
                )}
            </List>
        </Container>
    );
}
