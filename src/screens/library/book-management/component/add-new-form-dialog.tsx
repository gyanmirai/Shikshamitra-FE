// import React, { useState } from "react";
// import { TextField, Button, Grid, Typography, Paper } from "@mui/material";

// const AddBookForm = () => {
//   const [bookDetails, setBookDetails] = useState({
//     title: "",
//     author: "",
//     publisher: "",
//     category: "",
//     editions: [],
//   });

//   const [currentEdition, setCurrentEdition] = useState({
//     year: "",
//     totalCopies: "",
//     availableCopies: "",
//     notes: "",
//   });

//   const handleAddEdition = () => {
//     setBookDetails((prev) => ({
//       ...prev,
//       editions: [...prev.editions, currentEdition],
//     }));
//     setCurrentEdition({ year: "", totalCopies: "", availableCopies: "", notes: "" });
//   };

//   const handleSubmit = () => {
//     console.log("Book Details Submitted:", bookDetails);
//   };

//   return (
//     <Paper style={{ padding: 20 }}>
//       <Typography variant="h5" gutterBottom>Add Book</Typography>
//       <Grid container spacing={2}>
//         {/* General Book Details */}
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label="Title"
//             fullWidth
//             value={bookDetails.title}
//             onChange={(e) => setBookDetails({ ...bookDetails, title: e.target.value })}
//             required
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label="Author"
//             fullWidth
//             value={bookDetails.author}
//             onChange={(e) => setBookDetails({ ...bookDetails, author: e.target.value })}
//             required
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label="Publisher"
//             fullWidth
//             value={bookDetails.publisher}
//             onChange={(e) => setBookDetails({ ...bookDetails, publisher: e.target.value })}
//             required
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             label="Category/Subject"
//             fullWidth
//             value={bookDetails.category}
//             onChange={(e) => setBookDetails({ ...bookDetails, category: e.target.value })}
//             required
//           />
//         </Grid>

//         {/* Edition Details */}
//         <Grid item xs={12}>
//           <Typography variant="h6">Add Edition</Typography>
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField
//             label="Year"
//             fullWidth
//             value={currentEdition.year}
//             onChange={(e) => setCurrentEdition({ ...currentEdition, year: e.target.value })}
//             required
//           />
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField
//             label="Total Copies"
//             type="number"
//             fullWidth
//             value={currentEdition.totalCopies}
//             onChange={(e) => setCurrentEdition({ ...currentEdition, totalCopies: e.target.value })}
//             required
//           />
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField
//             label="Available Copies"
//             type="number"
//             fullWidth
//             value={currentEdition.availableCopies}
//             onChange={(e) => setCurrentEdition({ ...currentEdition, availableCopies: e.target.value })}
//             required
//           />
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField
//             label="Notes"
//             fullWidth
//             value={currentEdition.notes}
//             onChange={(e) => setCurrentEdition({ ...currentEdition, notes: e.target.value })}
//           />
//         </Grid>
//         <Grid item xs={12}>
//           <Button variant="outlined" onClick={handleAddEdition}>Add Edition</Button>
//         </Grid>

//         {/* Submit */}
//         <Grid item xs={12}>
//           <Button variant="contained" color="primary" onClick={handleSubmit}>
//             Submit
//           </Button>
//         </Grid>
//       </Grid>
//     </Paper>
//   );
// };

// export default AddBookForm;
