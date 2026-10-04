import { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'https://orzales-sarah-o.onrender.com';

function App() {
  const [token, setToken] = useState(
    localStorage.getItem('access_token')
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [products, setProducts] = useState([]);

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isLoggedIn = !!token;

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  // =========================
  // LOGIN
  // =========================

  const login = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      const accessToken = data.tokens.access_token;

      localStorage.setItem('access_token', accessToken);
      setToken(accessToken);

      setUsername('');
      setPassword('');
      setMessage('Login successful.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET PRODUCTS
  // =========================

  const fetchProducts = async () => {
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load products.');
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const saveProduct = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setLoading(true);

    const productData = {
      product_name: productName,
      description,
      price,
      quantity,
    };

    try {
      const url = editingId
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products/create`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save product.');
      }

      setMessage(
        editingId
          ? 'Product updated successfully.'
          : 'Product added successfully.'
      );

      clearForm();
      fetchProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================

  const editProduct = (product) => {
    setEditingId(product.id);
    setProductName(product.product_name);
    setDescription(product.description);
    setPrice(product.price);
    setQuantity(product.quantity);

    setMessage('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // =========================
  // DELETE
  // =========================

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_URL}/api/products/${id}/delete`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete product.');
      }

      setMessage('Product deleted successfully.');
      fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setEditingId(null);
    setProductName('');
    setDescription('');
    setPrice('');
    setQuantity('');
  };

  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setProducts([]);
    clearForm();
    setMessage('');
    setError('');
  };

  // =========================
  // LOGIN PAGE
  // =========================

  if (!isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand">
            <span className="brand-icon">L</span>
            <div>
              <h1>LavaLust</h1>
              <p>Product Management System</p>
            </div>
          </div>

          <h2>Admin Login</h2>
          <p className="login-subtitle">
            Sign in to manage your products.
          </p>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={login}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-note">
            Administrator access
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // PRODUCT DASHBOARD
  // =========================

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="logo">LavaLust</div>
          <span>Product Management</span>
        </div>

        <div className="topbar-right">
          <span>Admin</span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="container">

        {message && (
          <div className="alert success">
            {message}
          </div>
        )}

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <section className="form-card">
          <div className="section-heading">
            <div>
              <h2>
                {editingId ? 'Edit Product' : 'Add Product'}
              </h2>
              <p>
                {editingId
                  ? 'Update the product information below.'
                  : 'Enter the details of a new product.'}
              </p>
            </div>
          </div>

          <form onSubmit={saveProduct} className="product-form">
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product name"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading
                  ? 'Saving...'
                  : editingId
                  ? 'Update Product'
                  : 'Add Product'}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="products-section">
          <div className="section-heading">
            <div>
              <h2>Product List</h2>
              <p>
                Products retrieved from the LavaLust API.
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={fetchProducts}
            >
              Refresh
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>#{product.id}</td>
                      <td className="product-name">
                        {product.product_name}
                      </td>
                      <td>{product.description}</td>
                      <td>
                        ₱{Number(product.price).toFixed(2)}
                      </td>
                      <td>{product.quantity}</td>
                      <td>
                        <div className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => editProduct(product)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              deleteProduct(product.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;