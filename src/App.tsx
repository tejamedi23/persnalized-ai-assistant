import React from 'react';
import { AssistantDashboard } from './components/AssistantDashboard';
import { CalendarProvider } from './context/CalendarContext';
import { TravelProvider } from './context/TravelContext';
import { EmailProvider } from './context/EmailContext';
import { AIProvider } from './context/AIContext';

function App() {
  return (
    <CalendarProvider>
      <EmailProvider>
        <TravelProvider>
          <AIProvider>
            <AssistantDashboard />
          </AIProvider>
        </TravelProvider>
      </EmailProvider>
    </CalendarProvider>
  );
}

export default App;
