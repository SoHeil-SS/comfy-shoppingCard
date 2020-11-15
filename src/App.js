import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import userRepository from "./Core/UserRepository";
import Navbar from "./Components/Navbar";
import Header from "./Components/Header";
import ProductMapper from "./Components/ProductsComponents/ProductMapper.jsx";
import Factor from "./Components/FactorComponents/Factor";
import BuyCarts from "./Components/‌BuyCarts";
import SingAndLogin from "./Components/SignAndLogin";
import OurProducts from "./Components/OurProducts";
import ProductDetails from "./Components/ProductsComponents/ProductDetails";
import Loading from "./Components/Loading";
import Contexts from "./Contexts";
const App = () => {
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState(null);
  const [factorProducts, setFactorProducts] = useState([]);
  const [factorVisibility, setFactorVisibility] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState({ username: "", email: "", password: "" });
  const [signedUser, setSignedUser] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [path, setPath] = useState("/products");

  useEffect(() => {
    fetch("https://run.mocky.io/v3/72e6966f-b14c-47e6-a963-cac8e122d89b")
      .then((response) => response.json())
      .then((response) =>
        response.items.map((p) => {
          return {
            title: p.fields.title,
            id: p.sys.id,
            price: p.fields.price,
            image: p.fields.image.fields.file.url,
            alt: p.fields.title,
            // inStock: p.fields.inStock,
          };
        })
      )
      .then((products) =>
        setTimeout(() => {
          setProducts(products);
        }, 750)
      );
  }, []);

  const handleState = (factorProducts) => {
    totalPriceFn(factorProducts);
    if (!factorProducts.length) {
      setFactorProducts(factorProducts);
      setFactorVisibility(false);
    } else {
      setFactorProducts(factorProducts);
    }
  };

  const handlePath = (product, path) => {
    setProduct(product);
    console.log(path);
    if (path === "/") {
      setPath("product");
    } else setPath(path);
  };

  const handleAddProduct = (product, id) => {
    const factorCarts = [...factorProducts];
    const index = factorCarts.findIndex((p) => p.id === id);
    if (index === -1) {
      const p = { ...product };
      p.inCart = 1;
      p.total = p.price;
      factorCarts.push(p);
    } else {
      handleIncDec(id, +1);
    }
    handleState(factorCarts);
  };

  const handleIncDec = (id, op) => {
    let factorCarts = [...factorProducts];
    const index = factorCarts.findIndex((p) => p.id === id);
    factorCarts[index].inCart = factorCarts[index].inCart + op;
    if (factorCarts[index].inCart === 0) {
      factorCarts = factorCarts.filter((p) => p.id !== id);
    } else {
      factorCarts[index].total =
        factorCarts[index].inCart * factorCarts[index].price;
    }
    handleState(factorCarts);
  };

  const handleRemove = (id) => {
    const factorCarts = [...factorProducts].filter((p) => p.id !== id);
    handleState(factorCarts);
  };

  const openDialog = () => {
    handleFactorVisibility();
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 650);
  };

  const closeDialog = () => setIsDialogOpen(false);

  const handleFactorVisibility = () => setFactorVisibility(!factorVisibility);

  const handleClear = () => {
    closeDialog();
    setFactorProducts([]);
    setFactorVisibility(false);
  };

  const totalPriceFn = (factorProducts) => {
    let totalPrice = 0;
    factorProducts.forEach((p) => {
      totalPrice += p.total;
    });
    setFactorProducts(factorProducts);
    setTotalPrice(totalPrice);
  };

  const handleInputChange = (e) => {
    const name = e.target.name;
    setUser({ ...user, [name]: e.target.value });
  };

  const handleSignIn = (e) => {
    console.log(user.username);
    const userInRepository = userRepository.users.find(
      (u) => u.username === user.username
    );
    if (userInRepository) {
      setSignedUser({
        email: user.email,
        username: user.username,
        password: user.password,
      });
      setUser({ username: "", email: "", password: "" });
    } else {
      setUser({ username: "", email: "", password: "" });

      alert("user not find");
      e.preventDefault();
    }
  };

  const handleSignUp = (e) => {
    const userInRepository = userRepository.users.filter(
      (u) => u.username === user.username
    );
    if (userInRepository.length) {
      alert("please enter another username...");
      console.log(userInRepository);
      setUser({ username: "", email: "", password: "" });
      e.preventDefault();
      return;
    }
    userRepository.add(user.username, user.email, user.password);
    setSignedUser({
      email: user.email,
      username: user.username,
      password: user.password,
    });
    setUser({ username: "", email: "", password: "" });
  };

  console.log("render");
  if (!products) {
    return <Loading />;
  }
  return (
    <Contexts.Provider
      value={{
        factorProducts,
        handleRemove,
        handleState,
        handleIncDec,
        openDialog,
        isDialogOpen,
        totalPrice,
        signedUser,
        handlePath,
        handleClear,
        factorVisibility,
        handleFactorVisibility,
        handleAddProduct,
      }}
    >
      <Router>
        <Switch>
          <Route path={path}>
            <ProductDetails product={product} />
            <Factor />
          </Route>
          <Route path="/sign">
            <SingAndLogin
              username={user.username}
              password={user.password}
              email={user.email}
              handleInputChange={handleInputChange}
              handleSignIn={handleSignIn}
              handleSignUp={handleSignUp}
            />
          </Route>
          <Route path="/">
            <Navbar />
            <Header />
            <>
              <OurProducts />
              <ProductMapper products={products} />
              <Factor />
              <BuyCarts />
            </>
          </Route>
        </Switch>
      </Router>
    </Contexts.Provider>
  );
};
export default App;
