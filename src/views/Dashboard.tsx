import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Paper,
    Box,
    Button,
    Divider,
    CircularProgress,
} from "@mui/material";
import { getUsersPaginated } from "../service/userService";
import { UserProfile } from "../types/User";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");

const PAGE_SIZE = 20;

const Dashboard = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchUsers = useCallback(async (isInitial = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const result = await getUsersPaginated(PAGE_SIZE, isInitial ? null : lastDoc);
            if (isInitial) {
                setUsers(result.users);
            } else {
                setUsers((prev) => [...prev, ...result.users]);
            }
            setLastDoc(result.lastDoc);
            if (result.users.length < PAGE_SIZE) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    }, [lastDoc, loading]);

    useEffect(() => {
        fetchUsers(true);
    }, []);

    const groupedUsers = useMemo(() => {
        const groups: { [key: string]: UserProfile[] } = {};
        users.forEach((user) => {
            if (user.createdAt) {
                const date = user.createdAt.toDate();
                const dateKey = dayjs(date).format("dddd, D [de] MMMM [de] YYYY");
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(user);
            } else {
                const dateKey = "Data Desconhecida";
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(user);
            }
        });
        return groups;
    }, [users]);

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
                Dashboard de Usuários
            </Typography>

            {Object.keys(groupedUsers).map((date) => (
                <Box key={date} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                        {date.charAt(0).toUpperCase() + date.slice(1)}
                    </Typography>
                    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <List disablePadding>
                            {groupedUsers[date].map((user, index) => (
                                <React.Fragment key={user.uid}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemAvatar>
                                            <Avatar alt={user.displayName || ""} src={user.photoURL || ""} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={user.displayName || "Usuário sem nome"}
                                            secondary={
                                                <>
                                                    <Typography
                                                        sx={{ display: 'inline' }}
                                                        component="span"
                                                        variant="body2"
                                                        color="text.primary"
                                                    >
                                                        {user.email}
                                                    </Typography>
                                                    {user.createdAt && ` — ${dayjs(user.createdAt.toDate()).format("HH:mm")}`}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {index < groupedUsers[date].length - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                </Box>
            ))}

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress size={30} color="warning" />
                </Box>
            )}

            {!loading && hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => fetchUsers()}
                        sx={{ borderRadius: 28, px: 4 }}
                    >
                        Carregar Mais
                    </Button>
                </Box>
            )}

            {!hasMore && users.length > 0 && (
                <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
                    Fim da lista
                </Typography>
            )}
        </Container>
    );
};

export default Dashboard;
