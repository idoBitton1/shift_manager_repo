import React, { useState } from "react";
import "./Products.css"

//redux
import { useSelector, useDispatch } from 'react-redux';
import { ReduxState, actionsCreators } from "../../state";
import { bindActionCreators } from 'redux';

//material ui
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {
    Button, FormControl, InputLabel, MenuItem, Select, Typography,
    SelectChangeEvent
} from "@mui/material";

//interface
import { Product } from "../../Pages/Home";

//icons
import FavoriteIcon from '@mui/icons-material/Favorite';

//images
import img from "../../Images/j1.png"

interface MyProps extends Product {
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

export const ProductDisplay: React.FC<MyProps> = ({ id, name, price, quantity, categories, setProducts }) => {

    const filtered_products = useSelector((redux_state: ReduxState) => redux_state.filtered_products);
    const user = useSelector((redux_state: ReduxState) => redux_state.user);

    const [size, setSize] = useState<string>("");
    const [amount, setAmount] = useState<number>(1);
    const [err_text, setErrText] = useState<string>("");

    const [open_dialog, setOpenDialog] = useState<boolean>(false);

    const dispatch = useDispatch();
    const { updateSupply, addProductToCart } = bindActionCreators(actionsCreators, dispatch);

    const toggleDialog = () => {

        setSize("");
        setAmount(1);
        setErrText("");

        setOpenDialog((prev) => !prev);
    }

    const handleAmountSelect = (event: SelectChangeEvent<number>) => {
        const products_amount = event.target.value as number;

        setAmount(products_amount);
    }

    const handleAddToCard = () => {
        //if no user is connected, cant buy
        if (!user.token) {
            setErrText("log in to buy");
            return;
        }

        let index_of_product = filtered_products.findIndex((product) => product.id === id);
        if (filtered_products[index_of_product].quantity < amount) {
            setErrText("not enough in stock");
            return;
        }

        //checks that size isn't empty
        if (size === "") {
            setErrText("please choose size");
            return;
        }

        //update both arrays
        updateSupply({
            id: id,
            amount: amount
        });

        //update the amount of the product that was bought
        setProducts((prev_products) => {
            prev_products.map((product) => {
                if (product.id === id)
                    product.quantity = product.quantity - amount;
                return product;
            });
            return prev_products;
        });

        //format today
        const formatted_now = formatDate();

        //adds the product to the cart
        addProductToCart({
            product_id: id,
            size: size,
            amount: amount,
            address: "ddd",
            paid: false,
            ordering_time: formatted_now
        })

        toggleDialog();
    }

    const formatDate = ():string => {
        const today:Date = new Date();
        const yyyy:number = today.getFullYear();
        let mm:number = today.getMonth() + 1; // Months start at 0
        let dd:number = today.getDate();
    
        let ddd:string = `${dd}`;
        let mmm:string = `${mm}`;
        if (dd < 10) ddd = '0' + dd;
        if (mm < 10) mmm = '0' + mm;
    
        const formatted_today:string = yyyy + '/' + mmm + '/' + ddd;
        return formatted_today;
    }

    return (
        <>
            <div className="Product_container" onClick={toggleDialog}>
                <img src={img} alt={name} className="img product_img" />
                <div className="product_details">
                    <p className="product_name">{name}</p>
                    <p className="product_quantity">Left: {quantity}</p>
                </div>
                <div className="product_details">
                    <p className="product_price">{price}$</p>
                    <p className="product_oos">
                        {quantity === 0 ? "*out of stock" : ""}
                    </p>
                </div>
            </div>

            <Dialog open={open_dialog} onClose={toggleDialog} fullWidth>
                <DialogTitle>
                    <Typography
                        fontSize={25}
                        borderBottom={1}
                        borderColor={"lightgray"}
                        gutterBottom>
                        {name}
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <div className="buying_container">
                        <img src={img} alt={name} className="buying_img" />
                        <div className="buying_info">
                            <p>Left: {quantity}</p>

                            <p>${price}</p>

                            <div style={{ display: "flex" }}>
                                <p>amount: </p>
                                <FormControl variant="standard" sx={{ marginLeft: 1, marginTop: 1 }}>
                                    <Select
                                        id="amount_select"
                                        value={amount}
                                        onChange={handleAmountSelect}
                                    >
                                        <MenuItem value={1}>1</MenuItem>
                                        <MenuItem value={2}>2</MenuItem>
                                        <MenuItem value={3}>3</MenuItem>
                                        <MenuItem value={4}>4</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            {!categories.includes("bags") ?
                                <FormControl variant="standard" sx={{ marginBottom: 2 }}>
                                    <InputLabel>Size</InputLabel>
                                    <Select
                                        id="size_select"
                                        label="size"
                                        value={size}
                                        onChange={(event) => setSize(event.target.value as string)}
                                    >
                                        <MenuItem value={categories.includes("shoes") ? "41" : "XS"}>{categories.includes("shoes") ? "41" : "XS"}</MenuItem>
                                        <MenuItem value={categories.includes("shoes") ? "42" : "S"}>{categories.includes("shoes") ? "42" : "S"}</MenuItem>
                                        <MenuItem value={categories.includes("shoes") ? "43" : "M"}>{categories.includes("shoes") ? "43" : "M"}</MenuItem>
                                        <MenuItem value={categories.includes("shoes") ? "44" : "L"}>{categories.includes("shoes") ? "44" : "L"}</MenuItem>
                                        <MenuItem value={categories.includes("shoes") ? "45" : "XL"}>{categories.includes("shoes") ? "45" : "XL"}</MenuItem>
                                    </Select>
                                </FormControl>
                                :
                                <></>}

                            <div style={{ display: "flex" }}>
                                <Button variant="contained"
                                    onClick={handleAddToCard}
                                    sx={{ textTransform: "none", marginRight: 1, fontWeight: "bold" }}>
                                    Add To Cart
                                </Button>
                                <Button variant="outlined" endIcon={<FavoriteIcon />}
                                    sx={{ textTransform: "none", fontWeight: "bold" }}>
                                    Wishlist
                                </Button>
                            </div>
                            <p>{err_text ? `*${err_text}` : ""}</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}