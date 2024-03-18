import React from 'react';
import './App.css';
//import Editor from './Editor';
import { Container, Box, Typography, Button, AppBar, Toolbar, IconButton, makeStyles } from '@material-ui/core';
import { SaveAlt as SaveAltIcon, PictureAsPdf as PdfIcon, Description as WordIcon, TextFields as TextIcon } from '@material-ui/icons';
import Blocknote from './components/Blocknote';

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: '#1976d2',
  },
  title: {
    flexGrow: 1,
  },
  editorContainer: {
    backgroundColor: '#f5f5f5',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    minHeight: '60vh',
  },
}));

function App() {
  const classes = useStyles();

  const handleExportPDF = () => {
    // Export logic for PDF
  };

  const handleExportWord = () => {
    // Export logic for Word
  };

  const handleExportText = () => {
    // Export logic for Text
  };

  const handleSave = () => {
    // Export logic for Text
  };

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Modern Editor
          </Typography>
          <IconButton onClick={handleExportPDF} color="inherit">
            <PdfIcon />
          </IconButton>
          <IconButton onClick={handleExportWord} color="inherit">
            <WordIcon />
          </IconButton>
          <IconButton onClick={handleExportText} color="inherit">
            <TextIcon />
          </IconButton>
          <Button startIcon={<SaveAltIcon />} color="inherit" onClick={handleSave}>
            Save
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl">
        <Box mt={4} p={2}>
          <Box className={classes.editorContainer}>
            <Blocknote />
          </Box>
        </Box>
      </Container>
    </React.Fragment>
  );
}

export default App;
