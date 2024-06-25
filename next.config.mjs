/** @type {import('next').NextConfig} */
const nextConfig = {};

export default next.NextConfig;
// pages/index.js

import { useState, useEffect } from 'react';

// Function to fetch cards based on geolocation
const fetchCards = async (latitude, longitude) => {
  const response = await fetch(`/api/cards?lat=${latitude}&lon=${longitude}`);
  const data = await response.json();
  return data;
};

// Function to sort cards by created time
const sortByCreatedTime = (cards) => {
  return cards.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
};

// SearchBar Component
const SearchBar = ({ onSearch }) => (
  <input
    type="text"
    placeholder="Search..."
    onChange={(e) => onSearch(e.target.value)}
  />
);

// Cards Component
const Cards = ({ cards }) => (
  <div>
    {cards.map((card) => (
      <div key={card.id}>
        <h2>{card.title}</h2>
        <p>{card.description}</p>
      </div>
    ))}
  </div>
);

// HomePage Component
const HomePage = () => {
  const [cards, setCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch cards based on geolocation when component mounts
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      let fetchedCards = await fetchCards(latitude, longitude);
      fetchedCards = sortByCreatedTime(fetchedCards);
      setCards(fetchedCards);
    });
  }, []);

  // Filter cards based on search query
  const filteredCards = cards.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <SearchBar onSearch={setSearchQuery} />
      <Cards cards={filteredCards} />
    </div>
  );
};



