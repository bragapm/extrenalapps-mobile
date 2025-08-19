import React, {useEffect} from 'react';
import AppNavigation from './src/navigation';
import {useAuthStore} from './src/store/authStore';

const App = () => {
  useEffect(() => {
    useAuthStore.getState().loadAuthFromStorage();
  }, []);
  return (
    <>
      <AppNavigation />
    </>
  );
};

export default App;
