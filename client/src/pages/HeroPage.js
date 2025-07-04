import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';

function HeroPage() {
   const [jokes, setJokes] = useState([]);

   useEffect(() => {
      axios.get("/api/jokes")
      .then((response) => {
         setJokes(response.data)
      })
      .catch((err) => {
         console.log(`ERROR : ${err}`);
      })
   },[])

  return (
    <div>
      <Header/>
      No of Jokes: {jokes.length}
      <ul>
         {jokes.map((joke,index) => (
            <div key={joke.id}>
               <h3>{joke.title}</h3>
               <p>{joke.content}</p>
            </div>
         ))}
      </ul>
    </div>
  )
}

export default HeroPage