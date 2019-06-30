import React from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import {Typography, Container} from '@material-ui/core'
import { DBContext } from './data/db/dbContext.dexie';
import { ExampleList, SearchableExampleList } from './data/components/exampleList';
import { FileInput, DataIngestor } from './data/components/input/fileInput';
import { ClassContext } from './data/classes/classContext';
import { DataInputDialog } from './data/components/input/inputDialog';
import { ResetDBModal } from './data/components/input/resetDBModal';
function App() {
  return (
    <React.Fragment>
      <Container>
      <ClassContext>
      <DBContext>
            <CssBaseline />
            <Typography>
              Ylabel
            </Typography>
            <DataInputDialog />
            <SearchableExampleList />
      <ResetDBModal />
        </DBContext>
      </ClassContext>
      </Container>
    </React.Fragment>
  );
}

export default App;
