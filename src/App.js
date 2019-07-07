import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { Container,} from '@material-ui/core'
import { DBContext } from './data/db/dbContext.dexie';
import { ExampleList, } from './data/components/exampleList';
import { ClassContext } from './data/classes/classContext';
import { SearchContext } from './data/searchContext';
import { ResponsiveDrawer } from './layout/drawer';


function App() {

  return (
    <React.Fragment>
      
      <ClassContext>
      <DBContext>
        <SearchContext>
      
            <CssBaseline />
            <ResponsiveDrawer >
            <Container>

            
            
            <ExampleList />
            </Container>
            </ResponsiveDrawer>
            </SearchContext>
        </DBContext>
      </ClassContext>
      
    </React.Fragment>
  );
}

export default App;
