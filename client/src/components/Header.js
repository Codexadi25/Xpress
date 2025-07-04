import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Header() {
   const [user, setUser] = useState('No user logged in')
   useEffect(() => {
      axios.get('/api/user')
      .then((response) => {
         setUser(`@${response.data.username}`)
      })
      .catch((err) => {
         console.log(`ERROR : ${err}`);
      })
   },[])

  return (
    <div>
      <nav className="nav">
         UserID: {user}
      </nav>
    </div>
  )
}

export default Header