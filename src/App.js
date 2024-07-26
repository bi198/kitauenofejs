import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import moment from 'moment'; // Thêm thư viện moment.js

function App() {
  const [value, setValue] = useState('');
  const [action, setAction] = useState('paid'); // Giá trị mặc định là 'paid'
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(moment().format('YYYY-MM-DD')); // Ngày mặc định là hôm nay
  const [receipts, setReceipts] = useState([]);
  const [total, setTotal] = useState(0); // Thêm state để lưu tổng giá trị
  const [error, setError] = useState(null);
  const [spinnerValue, setSpinnerValue] = useState('Hanamasa'); // State để lưu giá trị của spinner

  useEffect(() => {
    // Lấy các receipt từ server
    axios
      .get('https://kitaueno.onrender.com/api/bill/receipt')
      .then((response) => {
        setReceipts(response.data);
      })
      .catch((error) => {
        console.error('Error fetching receipts:', error);
        setError('Error fetching receipts');
      });

    // Lấy tổng giá trị từ server
    axios
      .get('https://kitaueno.onrender.com/api/bill/total')
      .then((response) => {
        setTotal(response.data.total);
      })
      .catch((error) => {
        console.error('Error fetching total:', error);
        setError('Error fetching total');
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullDescription = `${description} - ${spinnerValue}`; // Kết hợp ghi chú và giá trị spinner
    axios
      .post('https://kitaueno.onrender.com/add-receipt', {
        value: parseInt(value),
        action, // Không thay đổi giá trị action
        description: fullDescription, // Ghi chú kết hợp với giá trị spinner
        date,
      })
      .then((response) => {
        setReceipts([response.data, ...receipts]);
        setValue('');
        setAction('paid'); // Đặt lại giá trị mặc định là 'paid'
        setDescription('');
        setDate(moment().format('YYYY-MM-DD')); // Đặt lại giá trị ngày mặc định là hôm nay
        setSpinnerValue('option1'); // Đặt lại giá trị spinner mặc định

        // Cập nhật tổng giá trị
        const newTotal =
          total + (action === 'received' ? parseInt(value) : -parseInt(value));
        setTotal(newTotal);
      })
      .catch((error) => {
        console.error('Error adding receipt:', error);
        setError('Error adding receipt');
      });
  };

  return (
    <div className="container">
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="row">
        <div className="col-md-4">
          <h1>Kế Hoạch Gia Đình</h1>
          <h3>Còn Lại: {total} ￥</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="date" className="form-label">
                Ngày:
              </label>
              <input
                type="date"
                id="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="row mb-3">
              <div className="col">
                <label htmlFor="value" className="form-label">
                  Số:
                </label>
                <input
                  type="number"
                  id="value"
                  className="form-control"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                />
              </div>
              <div className="col">
                <label htmlFor="action" className="form-label">
                  Hành động:
                </label>
                <select
                  id="action"
                  className="form-select"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  required
                >
                  <option value="received">Thêm Vào Quỹ</option>
                  <option value="paid">Mua</option>
                </select>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col">
                <label htmlFor="description" className="form-label">
                  Ghi chú:
                </label>
                <input
                  type="text"
                  id="description"
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="col">
                <label htmlFor="spinner" className="form-label">
                  Nơi Mua:
                </label>
                <select
                  id="spinner"
                  className="form-select"
                  value={spinnerValue}
                  onChange={(e) => setSpinnerValue(e.target.value)}
                >
                  <option value="Hanamasa">Hanamasa</option>
                  <option value="Gyomu">Gyomu</option>
                  <option value="Aeon">Aeon</option>
                  <option value="Khác">Khác</option>
                  {/* Thêm các tùy chọn khác nếu cần */}
                </select>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col">
                <button type="submit" className="btn btn-primary w-100">
                  Ghi vào
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="col-md-8">
          <h2>Danh sách các số đã nhập:</h2>
          <ul className="list-group">
            {receipts.map((receipt, index) => (
              <li
                key={index}
                className={`list-group-item ${
                  receipt.action === 'received'
                    ? 'list-group-item-success'
                    : 'list-group-item-warning'
                }`}
              >
                <div>
                  <strong>Ngày:</strong>{' '}
                  {moment(receipt.date).format('DD/MM/YYYY')} <br />
                  <strong>Tổng:</strong> {receipt.value} ￥<br />
                  {receipt.action === 'received' ? 'Thêm Vào Quỹ' : 'Mua'}{' '}
                  <br />
                  <strong>Ghi chú:</strong> {receipt.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
