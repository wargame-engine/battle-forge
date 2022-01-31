
import {
  TableRow
} from "@mui/material";
import { styled } from '@mui/material/styles';

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  th: {
    color: 'inherit'
  },
  '& .MuiTableCell-sizeSmall': {
    padding: "5px 0px 5px 5px" // <-- arbitrary value
  },
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));