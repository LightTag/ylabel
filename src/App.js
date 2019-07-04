import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {Typography, Container, AppBar, CardMedia} from '@material-ui/core'
import { DBContext } from './data/db/dbContext.dexie';
import { ExampleList, SearchableExampleList } from './data/components/exampleList';
import { FileInput, DataIngestor } from './data/components/input/fileInput';
import { ClassContext } from './data/classes/classContext';
import { DataInputDialog } from './data/components/input/inputDialog';
import { ResetDBModal } from './data/components/input/resetDBModal';
import { YLabelAppbar } from './layout/Appbar';
import { SearchContext } from './data/searchContext';
function App() {
  return (
    <React.Fragment>
      
      <ClassContext>
      <DBContext>
        <SearchContext>
      <YLabelAppbar/>
            <CssBaseline />
            <Container>
            
            <DataInputDialog />
            <ExampleList />
            </Container>
            </SearchContext>
        </DBContext>
      </ClassContext>
      
    </React.Fragment>
  );
}

export default App;
