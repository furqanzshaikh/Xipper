import axios from 'axios';
import React, { useEffect, useState } from 'react';

const HomePage = () => {
    const [users, setUsers] = useState([]);

    const getUsers = async () => {
        try {
            const response = await axios.get('/data/users.json');
            setUsers(response.data);
            console.log('Fetched data:', response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Users</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {users.map((user) => (
                    <div key={user.id} className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">{user.name}</h2>
                        <p className="text-gray-600 truncate">Email: {user.email}</p>
                        <p className="text-gray-600 mt-2">
                            Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Date not available'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
