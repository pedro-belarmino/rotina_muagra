import { useEffect, useState } from "react";
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Avatar, TablePagination } from "@mui/material";
import { getAllUsers, getUserStats, UserProfile } from "../service/userService";
import { Timestamp } from "firebase/firestore";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/admin";
import { Navigate } from "react-router-dom";

interface UserWithStats extends UserProfile {
    totalClicks: number;
    lastClick: Timestamp | null;
}

type SortOption = "recent" | "oldest" | "alphabetical";

export default function AdminDashboard() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<SortOption>("recent");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userProfiles = await getAllUsers();
                const usersWithStats = await Promise.all(
                    userProfiles.map(async (user) => {
                        const stats = await getUserStats(user.uid);
                        return { ...user, ...stats };
                    })
                );
                setUsers(usersWithStats);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const sortedUsers = [...users].sort((a, b) => {
        if (sortBy === "recent") {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
        } else if (sortBy === "oldest") {
            return a.createdAt.toMillis() - b.createdAt.toMillis();
        } else if (sortBy === "alphabetical") {
            const nameA = a.displayName || a.email || "";
            const nameB = b.displayName || b.email || "";
            return nameA.localeCompare(nameB);
        }
        return 0;
    });

    const paginatedUsers = sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (!isAdmin(currentUser?.email)) {
        return <Navigate to="/home" replace />;
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress color="warning" />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4, pb: 10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    Painel do Administrador
                </Typography>

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel id="sort-select-label">Ordenar por</InputLabel>
                    <Select
                        labelId="sort-select-label"
                        value={sortBy}
                        label="Ordenar por"
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                    >
                        <MenuItem value="recent">Mais recente</MenuItem>
                        <MenuItem value="oldest">Mais antigo</MenuItem>
                        <MenuItem value="alphabetical">Ordem alfabética</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell>Usuário</TableCell>
                            <TableCell align="center">Criado em</TableCell>
                            <TableCell align="center">Total de Cliques</TableCell>
                            <TableCell align="center">Último Clique</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.uid} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={user.photoURL || undefined} alt={user.displayName || ""}>
                                            {user.displayName?.[0] || user.email?.[0] || "?"}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="body1" fontWeight="medium">
                                                {user.displayName || "Sem nome"}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    {dayjs(user.createdAt.toDate()).format("DD/MM/YYYY HH:mm")}
                                </TableCell>
                                <TableCell align="center">
                                    <Typography fontWeight="bold" color="warning.main">
                                        {user.totalClicks}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    {user.lastClick
                                        ? dayjs(user.lastClick.toDate()).format("DD/MM/YYYY HH:mm")
                                        : "Nunca"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 20, 50]}
                component="div"
                count={users.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Usuários por página"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
            />
        </Container>
    );
}
