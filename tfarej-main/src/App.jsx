// Import necessary modules and components from external and local files
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { fetchDataFromApi } from "./utils/api";

import { useSelector, useDispatch } from "react-redux";
import { getApiConfiguration, getGenres } from "./store/homeSlice";

import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import Home from "./pages/home/Home";
import Details from "./pages/details/Details";
import SearchResult from "./pages/searchResult/SearchResult";
import Explore from "./pages/explore/Explore";
import PageNotFound from "./pages/404/PageNotFound";
import { useAuthContext } from "./hooks/useAuthContext";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";


// Define the main function component called App
function App() {
    const { user } = useAuthContext()

    // Get access to the Redux dispatch function
    const dispatch = useDispatch();
    
    // Select and store the 'url' state from the Redux store using the 'useSelector' hook
    const { url } = useSelector((state) => state.home);
    
    // Log the 'url' to the console
    console.log(url);

    // Define an effect to run when the component mounts
    useEffect(() => {
        // Call the 'fetchApiConfig' and 'genresCall' functions
        fetchApiConfig();
        genresCall();
    }, []);

    // Define a function to fetch API configuration data
    const fetchApiConfig = () => {
        // Make an API request to retrieve configuration data
        fetchDataFromApi("/configuration").then((res) => {
            // Log the API response.
            console.log(res);

            // Create an 'url' object based on the API response
            const url = {
                backdrop: res.images.secure_base_url + "original",
                poster: res.images.secure_base_url + "original",
                profile: res.images.secure_base_url + "original",
            };

            // Dispatch an action to update Redux state with the API configuration data
            dispatch(getApiConfiguration(url));
        });
    };

    // Define an asynchronous function to fetch genre data
    const genresCall = async () => {
        // Initialize empty arrays and an object
        let promises = [];
        let endPoints = ["tv", "movie"];
        let allGenres = {};

        // Iterate over 'endPoints' and push API requests to 'promises' array
        endPoints.forEach((url) => {
            promises.push(fetchDataFromApi(`/genre/${url}/list`));
        });

        // Wait for all promises to resolve
        const data = await Promise.all(promises);
        
        // Log the fetched data
        console.log(data);
        
        // Map over the data and extract genres to populate 'allGenres' object
        data.map(({ genres }) => {
            return genres.map((item) => (allGenres[item.id] = item));
        });

        // Dispatch an action to update Redux state with the genre data
        dispatch(getGenres(allGenres));
    };

    // Render the application's UI components within a React Router
    return (
        <div className="App">
        <BrowserRouter>
            <Header />
            <div className="pages">
            <Routes>
            <Route 
              path="/"
              element={user ? <Home /> : <Navigate to="/login"/>}
            />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/" />} 
            />
            <Route 
              path="/signup" 
              element={!user ? <Signup /> : <Navigate to="/" />}            />
                 <Route 
              path="/:mediaType/:id"
              element={user ? <Details /> : <Navigate to="/login"/>}
            />
                <Route 
              path="/search/:query"
              element={user ? <SearchResult /> : <Navigate to="/login"/>}
            />
                <Route 
              path="/explore/:mediaType"
              element={user ? <Explore /> : <Navigate to="/login"/>}
            />
                <Route path="*" element={<PageNotFound />} />
            </Routes>
            </div>
            <Footer />
        </BrowserRouter>
        </div>

    );
}

// Export the 'App' component as the default export
export default App;
