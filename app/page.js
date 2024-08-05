'use client'
import { useState, useEffect, useCallback } from "react";
import { firestore } from "@/firebase";
import { Box, Typography, Stack, Button, Modal, TextField, CircularProgress, Snackbar, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, AppBar, Toolbar, Grid, Card, CardContent, CardActions, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

function InventoryModal({ open, handleClose, addItem, itemName, setItemName }) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add Item
        </Typography>
        <Stack width="100%" direction={'row'} spacing={2}>
          <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              addItem(itemName);
              setItemName('');
              handleClose();
            }}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

function InventoryItem({ name, quantity, increaseQuantity, decreaseQuantity, removeItem, handleConfirmOpen }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Typography>
          <Typography color="textSecondary">
            Quantity: {quantity}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={() => increaseQuantity(name)}
            startIcon={<ArrowUpwardIcon />}
          >
            Increase
          </Button>
          <Button
            size="small"
            color="primary"
            onClick={() => decreaseQuantity(name)}
            startIcon={<ArrowDownwardIcon />}
          >
            Decrease
          </Button>
          <Button
            size="small"
            color="secondary"
            onClick={() => handleConfirmOpen(name)}
            startIcon={<DeleteIcon />}
          >
            Remove
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
}

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuantity, setFilterQuantity] = useState('');

  const updateInventory = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(firestore, 'inventory')));
      const inventoryList = snapshot.docs.map(doc => ({ name: doc.id, ...doc.data() }));
      setInventory(inventoryList);
      setFilteredInventory(inventoryList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateInventory();
  }, [updateInventory]);

  const addItem = useCallback(async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }
      await updateInventory();
      setNotification({ open: true, message: 'Item added successfully!', severity: 'success' });
    } catch (error) {
      console.error("Error adding item:", error);
      setNotification({ open: true, message: 'Error adding item', severity: 'error' });
    }
  }, [updateInventory]);

  const removeItem = useCallback(async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }
      await updateInventory();
      setNotification({ open: true, message: 'Item removed successfully!', severity: 'success' });
    } catch (error) {
      console.error("Error removing item:", error);
      setNotification({ open: true, message: 'Error removing item', severity: 'error' });
    }
  }, [updateInventory]);

  const increaseQuantity = useCallback(async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await setDoc(docRef, { quantity: quantity + 1 });
      }
      await updateInventory();
    } catch (error) {
      console.error("Error increasing quantity:", error);
      setNotification({ open: true, message: 'Error increasing quantity', severity: 'error' });
    }
  }, [updateInventory]);

  const decreaseQuantity = useCallback(async (item) => {
    try {
      const docRef = doc(collection(firestore, 'inventory'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity > 1) {
          await setDoc(docRef, { quantity: quantity - 1 });
        }
      }
      await updateInventory();
    } catch (error) {
      console.error("Error decreasing quantity:", error);
      setNotification({ open: true, message: 'Error decreasing quantity', severity: 'error' });
    }
  }, [updateInventory]);

  const handleConfirmOpen = (item) => {
    setItemToRemove(item);
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setItemToRemove(null);
  };

  const handleRemoveConfirm = () => {
    if (itemToRemove) {
      removeItem(itemToRemove);
    }
    handleConfirmClose();
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    filterInventory(value, filterQuantity);
  };

  const handleFilterQuantityChange = (event) => {
    const value = event.target.value;
    setFilterQuantity(value);
    filterInventory(searchTerm, value);
  };

  const filterInventory = (searchTerm, filterQuantity) => {
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filterQuantity) {
      filtered = filtered.filter(item =>
        item.quantity >= parseInt(filterQuantity, 10)
      );
    }

    setFilteredInventory(filtered);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Inventory Management
          </Typography>
          <Button color="inherit" onClick={handleOpen} startIcon={<AddIcon />}>
            Add Item
          </Button>
        </Toolbar>
      </AppBar>
      <InventoryModal
        open={open}
        handleClose={handleClose}
        addItem={addItem}
        itemName={itemName}
        setItemName={setItemName}
      />
      <Box sx={{ padding: 3 }}>
        <Stack direction="row" spacing={2} mb={2}>
          <TextField
            id="search"
            label="Search Items"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FormControl fullWidth variant="outlined">
            <InputLabel id="filter-quantity-label">Filter by Quantity</InputLabel>
            <Select
              labelId="filter-quantity-label"
              id="filter-quantity"
              value={filterQuantity}
              onChange={handleFilterQuantityChange}
              label="Filter by Quantity"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              <MenuItem value={1}>1+</MenuItem>
              <MenuItem value={5}>5+</MenuItem>
              <MenuItem value={10}>10+</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="300px">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredInventory.map(({ name, quantity }) => (
              <InventoryItem
                key={name}
                name={name}
                quantity={quantity}
                increaseQuantity={increaseQuantity}
                decreaseQuantity={decreaseQuantity}
                removeItem={removeItem}
                handleConfirmOpen={handleConfirmOpen}
              />
            ))}
          </Grid>
        )}
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={confirmOpen}
        onClose={handleConfirmClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Removal"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to remove this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Cancel</Button>
          <Button onClick={handleRemoveConfirm} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
