import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {Typography} from '@material-ui/core'
import { DBContext } from './data/db/dbContext.dexie';
import { ExampleList, SearchableExampleList } from './data/components/exampleList';
import { FileInput, DataIngestor } from './data/components/input/fileInput';
import { ClassContext } from './data/classes/classContext';
function App() {
  return (
    <React.Fragment>
      <ClassContext>
      <DBContext>
            <CssBaseline />
            <Typography>
              Ylabel
            </Typography>
            <DataIngestor />
            <SearchableExampleList />

        </DBContext>
      </ClassContext>
    </React.Fragment>
  );
}

export default App;
