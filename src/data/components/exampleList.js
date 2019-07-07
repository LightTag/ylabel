/*
    This is the grossest part of the code. 
    We're solving two problems here
    1. The number of examples froma  query is unbounded, so we are potentially rendering A LOT of things and that can lead to performance degradation
    2. The length of the text in each result is unkown and unbounded, but we want don't want the user to have to scroll forever to get through an example. 

    We're using react-virtualized to solve both, since that's what it does. It's just very strange for the uninitiated, hence this long comment. 

    Basically, RV manages mounting and unmounting compenents for us, so at any given time only a few are actually in the DOM. We use it's CellMeasurer
    component to figure out how high each example should be. 

    When a user is scrolling within a query result, we want to cache the height, so we use it's measure cache, but if the query changes the cache 
    is no longer valid, since it uses the index in the array of examples which changes. To solve that, we memoize the cache based on the example list. 

    It's not deep, but it's complex and makes a difference for the user
*/
import React from 'react'
import { makeStyles, Grid, Container, CircularProgress, LinearProgress,  } from '@material-ui/core';
import { CellMeasurer, CellMeasurerCache, List } from 'react-virtualized';
import { Example } from './example';
import { useSearch } from '../searchContext';
  
const useStyles = makeStyles(theme => ({
    root: {
        '&:focus': {
            outline: 0
        },

        '&::-webkit-scrollbar': {
            display: 'hidden'
        }

    }
}))
export const ExampleList = (props) => {
    const [height, setHeight] = React.useState(0);
    const [width, setWidth] = React.useState(0);
    const search = useSearch()

    const cache = React.useMemo(()=>{
        /* This is where we memoize the cache based on the given set of examples */
        return  new CellMeasurerCache({
            defaultHeight: 50,
            fixedWidth: true
          });
        
    },[search.examples])
    const ref = React.useCallback(node => {
        if (node !== null && height === 0) {
            /*
                Measure the height of the element that contains the list so we know how much space we have
                TODO - Make this responsive, e.g. if the user resized the screen adjust. 
            */
            setHeight(node.clientHeight);
            setWidth(node.clientWidth);
        }
    })
    const examples = search.examples;



    const exampleRenderer = ({  index, isScrolling, key, parent, style  }) => {
        /*
            This function renderes each example in the list. RV calls it when the item is about to come into view
        */
        const example = examples[index]
        return (
            <CellMeasurer
            cache={cache}
            columnIndex={0}
            key={key}
            parent={parent}
            rowIndex={index}
          >
            {({ measure }) => ( //Not sure what measure does, it was in the example I found. 

            <Grid item xs={10} style={{ ...style,  }} key={key} >
                <Example
                    handleUpdateExample={props.handleUpdateExample}
                    extraStyle={{ style }}
                    orderIndex={1}
                    key={example.id}
                    example={example}
                    anno_source={props.anno_source}
                    schema={props.schema}
                />

            </Grid>
            )
            }
            </CellMeasurer>


        )
    }
    const classes = useStyles()
    if (search.searching){
        return <LinearProgress />
    }
    return (
        <Container style={{height:'86vh',marginTop:'2rem'}}>
        <div className={classes.root} style={{ position: 'relative', height: '100%', width:'100%', overflow: 'hidden' }} ref={ref}>
        <Grid container alignItems="center" justify="center">
            <List //This is the list of items 
                height={height}
                deferredMeasurementCache={cache}
                rowHeight={cache.rowHeight}
                rowRenderer={exampleRenderer}
                width={width}
                rowCount={examples.length}
            />
            </Grid>
        </div>
        </Container>
    )
}


