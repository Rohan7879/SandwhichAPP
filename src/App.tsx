import React, { useState, useEffect, useRef } from "react";
import {
  IonApp,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonButtons,
  IonIcon,
  IonFab,
  IonFabButton,
  setupIonicReact,
} from "@ionic/react";
import { add, remove, print, close } from "ionicons/icons";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
// import './theme/variables.css'; // Not strictly needed if using Tailwind directly

setupIonicReact();

// Define menu items with their prices (hardcoded)
const menu = [
  { id: "aloo-matar-grilled", name: "Aloo Matar Grilled", price: 30 },
  { id: "aloo-matar-veg-grilled", name: "Aloo Matar Veg Grilled", price: 40 },
  { id: "aloo-matar-cheese-grilled", name: "Aloo Matar Cheese Grilled", price: 50 },
  { id: "aloo-matar-veg-cheese-grilled", name: "Aloo Matar Veg Cheese Grilled", price: 60 },
  { id: "cheese-chutney-garlic", name: "Cheese Chutney Garlic", price: 80 },
  { id: "cheese-garlic-garlic", name: "Cheese Garlic Garlic", price: 80 },
  { id: "cheese-corn-garlic", name: "Cheese Corn Garlic", price: 80 },
  { id: "cheese-chili-garlic", name: "Cheese Chili Garlic", price: 80 },
  { id: "vegetable-sandwich", name: "Vegetable Sandwich", price: 70 },
  { id: "vegetable-grilled-sandwich", name: "Vegetable Grilled Sandwich", price: 80 },
  { id: "veg-cheese-sandwich", name: "Veg Cheese Sandwich", price: 90 },
  { id: "veg-cheese-grilled-sandwich", name: "Veg Cheese Grilled Sandwich", price: 100 },
  { id: "classic-club", name: "Classic Club", price: 110 },
  { id: "schezwan-club", name: "Schezwan Club", price: 120 },
  { id: "italian-club", name: "Italian Club", price: 130 },
  { id: "tandoori-club", name: "Tandoori Club", price: 140 },
  { id: "mexican-club", name: "Mexican Club", price: 150 },
];

// Main App Component
const App: React.FC = () => {
  // State to store current order items and quantities
  const [order, setOrder] = useState<{ [key: string]: { id: string; name: string; price: number; quantity: number } }>(
    {}
  );
  // State for modal visibility
  const [showBillModal, setShowBillModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [billContent, setBillContent] = useState<string>("");
  const billModalRef = useRef<HTMLIonModalElement>(null);

  // Calculate subtotal and total whenever the order changes
  const calculateTotals = () => {
    let subtotal = 0;
    for (const itemId in order) {
      const item = order[itemId];
      subtotal += item.price * item.quantity;
    }
    return { subtotal, total: subtotal };
  };

  const { subtotal, total } = calculateTotals();

  // Function to adjust quantity based on button click
  const adjustQuantity = (itemId: string, isAdd: boolean) => {
    setOrder((prevOrder) => {
      const item = menu.find((i) => i.id === itemId);
      if (!item) {
        console.error(`Item with ID ${itemId} not found.`);
        return prevOrder;
      }

      let currentQuantity = prevOrder[itemId] ? prevOrder[itemId].quantity : 0;

      if (isAdd) {
        currentQuantity++;
      } else {
        currentQuantity--;
      }

      if (currentQuantity < 0) {
        currentQuantity = 0;
      }

      const newOrder = { ...prevOrder };
      if (currentQuantity > 0) {
        newOrder[itemId] = { ...item, quantity: currentQuantity };
      } else {
        delete newOrder[itemId];
      }
      return newOrder;
    });
  };

  // Function to generate the bill content as HTML string
  const generateBillContent = () => {
    if (Object.keys(order).length === 0) {
      alert("Please add items to the order before generating a bill.");
      return "";
    }

    let lastBillNo = parseInt(localStorage.getItem("lastBillNo") || "0") || 0;
    lastBillNo++;
    const billNo = `SW-${String(lastBillNo).padStart(6, "0")}`;
    localStorage.setItem("lastBillNo", lastBillNo.toString());

    const now = new Date();
    const billDate = now.toLocaleDateString("en-GB"); // DD/MM/YYYY
    const billTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    let itemsHtml = "";
    let currentSubtotal = 0;
    for (const itemId in order) {
      const item = order[itemId];
      const itemTotal = item.price * item.quantity;
      currentSubtotal += itemTotal;
      itemsHtml += `
        <tr>
            <td class="item-col-print">${item.name}</td>
            <td class="qty-col-print">${item.quantity}</td>
            <td class="price-col-print">${item.price.toFixed(2)}</td>
            <td class="total-col-print">${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    }

    const currentTotal = currentSubtotal;

    return `
      <div class="bill-print-content">
          <div class="header">
              <center><img src="./src/assets/images/img.jpg" alt="Sandwichwala Logo" class="brand-logo-print" onerror="this.onerror=null;this.src='https://placehold.co/50x50/6366f1/ffffff?text=LOGO';" />
              <h2>Sandwich Vala</h2>
              <p>keshod, Gujarat</p>
              <p>Phone: +91 91068 91372</p>
              <p class="sales-receipt">Sales Receipt</p></center>
          </div>
          
          <div class="bill-info">
              <span>Bill No: ${billNo}</span>
              <span>Date: ${billDate} ${billTime}</span>
          </div>
  
          <table class="item-table-print">
              <thead>
                  <tr>
                      <th class="item-col-print">ITEM</th>
                      <th class="qty-col-print">QTY</th>
                      <th class="price-col-print">PRICE</th>
                      <th class="total-col-print">TOTAL</th>
                  </tr>
              </thead>
              <tbody>
                  ${itemsHtml}
              </tbody>
          </table>
          <div class="summary">
              <div class="summary-item">
                  <span>Subtotal:</span>
                  <span>₹${currentSubtotal.toFixed(2)}</span>
              </div>
              <div class="summary-item summary-total">
                  <span>Total:</span>
                  <span>₹${currentTotal.toFixed(2)}</span>
              </div>
          </div>
          <div class="footer">
              <p>Thank you for your visit!</p>
              <p>Please come again!</p>
          </div>
          <div class="signature-area">
              <div class="signature-line">Customer Signature</div>
              <div class="signature-line">Authorized Signature</div>
          </div>
      </div>
    `;
  };

  // Handle Generate Bill button click
  const handleGenerateBill = () => {
    const content = generateBillContent();
    if (content) {
      setBillContent(content);
      setShowBillModal(true);
    }
  };

  // Handle Clear Order button click with custom confirmation
  const handleClearOrder = () => {
    if (Object.keys(order).length === 0) {
      return; // No items to clear
    }
    setShowConfirmModal(true);
  };

  // Confirm clear order
  const confirmClearOrder = (confirmed: boolean) => {
    setShowConfirmModal(false);
    if (confirmed) {
      setOrder({}); // Clear the order
    }
  };

  // Print bill function
  const printBill = () => {
    // This will trigger the browser's print dialog for the modal content
    if (billModalRef.current) {
      const modalContent = billModalRef.current.querySelector(".bill-print-content");
      if (modalContent) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write("<html><head><title>Sandwich Vala Bill</title>");
          // Copy styles for printing
          printWindow.document.write("<style>");
          // Inline styles for the print content to ensure they are applied
          printWindow.document.write(`
                    body { margin: 0; padding: 0; }
                    .bill-print-content {
                        width: 58mm;
                        margin: 0;
                        padding: 2px; /* Even less padding for maximum content space */
                        box-shadow: none;
                        border-radius: 0;
                        font-family: 'monospace', 'Courier New', monospace;
                        font-size: 8px; /* Even smaller base font */
                        line-height: 1; /* Very tight line spacing */
                        color: black;
                        box-sizing: border-box;
                    }
                    .bill-print-content .header { text-align: center; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px dashed black; }
                    .bill-print-content .header .brand-logo-print {
                        width: 30px; /* Smaller logo */
                        height: 30px;
                        object-fit: cover;
                        border-radius: 50%;
                        margin: 0 auto 2px auto; /* Center and reduce margin */
                        display: block;
                    }
                    .bill-print-content .header h2 { font-size: 12px; font-weight: bold; margin: 0; line-height: 1; } /* Smaller title */
                    .bill-print-content .header p { font-size: 7px; margin: 0; word-wrap: break-word; } /* Smallest address/phone */
                    .bill-print-content .header .sales-receipt { font-size: 8px; font-weight: bold; margin-top: 6px; margin-bottom: 3px; text-transform: uppercase; border-top: 1px dashed black; padding-top: 3px; }
                    .bill-info { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 8px; border-bottom: 1px dashed black; padding-bottom: 3px; }
                    .bill-info span { white-space: nowrap; }
                    .item-table-print { width: 100%; border-collapse: collapse; margin-bottom: 5px; table-layout: fixed; }
                    .item-table-print th, .item-table-print td { padding: 1px 0; font-size: 8px; border-bottom: 1px dotted #ccc; word-wrap: break-word; }
                    .item-table-print thead th.item-col-print { text-align: left; width: 50%; } /* ITEM header left-aligned, adjusted width */
                    .item-table-print thead th.qty-col-print { text-align: center; width: 15%; } /* QTY header centered, adjusted width */
                    .item-table-print thead th.price-col-print { text-align: right; width: 17.5%; } /* PRICE header right-aligned, adjusted width */
                    .item-table-print thead th.total-col-print { text-align: right; width: 17.5%; } /* TOTAL header right-aligned, adjusted width */
                    .item-table-print tbody td.item-col-print { text-align: left; } /* Item name left-aligned */
                    .item-table-print tbody td.qty-col-print { text-align: center; } /* Quantity centered */
                    .item-table-print tbody td.price-col-print { text-align: right; } /* Price right-aligned */
                    .item-table-print tbody td.total-col-print { text-align: right; } /* Total right-aligned */
                    .summary { margin-top: 6px; padding-top: 3px; border-top: 1px dashed black; }
                    .summary .summary-item { display: flex; justify-content: space-between; margin: 1px 0; font-size: 9px; }
                    .summary .summary-total { font-size: 10px; font-weight: bold; margin-top: 2px; border-top: 1px solid black; padding-top: 2px; }
                    .footer { text-align: center; margin-top: 8px; padding-top: 3px; border-top: 1px dashed black; }
                    .footer p { font-size: 7px; margin: 1px 0; }
                    .signature-area { margin-top: 10px; display: flex; flex-direction: column; align-items: center; font-size: 7px; gap: 3px; }
                    .signature-line { border-top: 1px solid black; width: 80%; padding-top: 1px; text-align: center; }
                `);
          printWindow.document.write("</style></head><body>");
          printWindow.document.write(modalContent.innerHTML);
          printWindow.document.write("</body></html>");
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }
      }
    }
  };

  return (
    <IonApp>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="text-center font-extrabold text-gray-900">Sandwich Vala</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="container mx-auto p-4 md:p-8 bg-white rounded-2xl shadow-xl flex flex-col md:flex-row gap-8 md:gap-12 my-8">
          {/* Header Branding */}
          <div className="header-branding flex items-center justify-center mb-8 md:mb-0 w-full md:w-auto">
            <img
              src="./src/assets/images/img.jpg"
              alt="Sandwichwala Logo"
              className="brand-logo w-[512px] h-[512px] object-cover rounded-full mr-4 shadow-md"
              onError={(e: any) => (e.target.src = "https://placehold.co/80x80/6366f1/ffffff?text=LOGO")}
            />
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              <center>Sandwich Vala</center>
            </h1>
          </div>

          {/* Menu Section */}
          <div className="menu-section flex flex-col p-6 border border-gray-200 rounded-lg shadow-sm flex-1">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-800">
              <center>Our Menu</center>
            </h2>
            <IonList className="space-y-2">
              {menu.map((item) => (
                <IonItem
                  key={item.id}
                  className="menu-item flex justify-between items-center py-3 border-b border-dashed border-gray-300 last:border-b-0"
                >
                  <IonLabel className="text-lg font-medium text-gray-700">{item.name}</IonLabel>
                  <span className="text-gray-700">₹{item.price.toFixed(2)}</span>
                  <div className="quantity-controls flex items-center gap-2">
                    <IonButton
                      size="small"
                      onClick={() => adjustQuantity(item.id, false)}
                      className="quantity-button bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg w-9 h-9 flex items-center justify-center text-xl shadow-sm"
                    >
                      <IonIcon icon={remove} />
                    </IonButton>
                    <span className="quantity-display w-12 text-center font-bold text-gray-800 text-lg">
                      {order[item.id] ? order[item.id].quantity : 0}
                    </span>
                    <IonButton
                      size="small"
                      onClick={() => adjustQuantity(item.id, true)}
                      className="quantity-button bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg w-9 h-9 flex items-center justify-center text-xl shadow-sm"
                    >
                      <IonIcon icon={add} />
                    </IonButton>
                  </div>
                </IonItem>
              ))}
            </IonList>
          </div>

          {/* Bill Section */}
          <div className="bill-section flex flex-col p-6 border border-gray-200 rounded-lg shadow-sm flex-1">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-800">
              <center>Current Order</center>
            </h2>
            <div id="bill-items" className="flex-grow space-y-2">
              {Object.keys(order).length === 0 ? (
                <center>
                  {" "}
                  <p id="no-items-message" className="text-gray-500 text-center text-lg">
                    No items selected yet.
                  </p>
                </center>
              ) : (
                <IonList>
                  {Object.values(order).map((item) => (
                    <IonItem
                      key={item.id}
                      className="bill-item flex justify-between items-center py-3 border-b border-dashed border-gray-300 last:border-b-0"
                    >
                      <IonLabel className="font-medium text-gray-700">
                        {item.name} (x{item.quantity})
                      </IonLabel>
                      <span className="text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </div>

            <div id="bill-summary" className="bill-summary mt-6 pt-4 border-t border-dashed border-gray-300">
              <center>
                {" "}
                <div className="flex justify-between py-2 text-lg">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
              </center>
              <center>
                {" "}
                <div className="bill-total flex justify-between py-3 text-xl font-extrabold text-gray-900 border-t-2 border-gray-200 mt-3">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </center>
            </div>

            <div className="flex flex-col gap-4 mt-8">
              <IonButton
                expand="block"
                onClick={handleGenerateBill}
                className="button-primary bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md uppercase tracking-wide"
              >
                Generate Bill
              </IonButton>
              <IonButton
                expand="block"
                onClick={handleClearOrder}
                className="button-secondary bg-gray-400 hover:bg-gray-500 text-gray-800 font-semibold py-3 rounded-lg shadow-md uppercase tracking-wide"
              >
                Clear Order
              </IonButton>
            </div>
          </div>
        </div>

        {/* Custom Confirmation Modal */}
        <IonModal
          isOpen={showConfirmModal}
          onDidDismiss={() => confirmClearOrder(false)}
          className="custom-modal-overlay"
        >
          <div className="custom-modal-content bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Confirm Action</h3>
            <p className="text-gray-700 text-lg">Are you sure you want to clear the entire order?</p>
            <div className="modal-buttons flex justify-center gap-4 mt-8">
              <IonButton
                onClick={() => confirmClearOrder(true)}
                className="modal-button confirm bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md"
              >
                Yes, Clear
              </IonButton>
              <IonButton
                onClick={() => confirmClearOrder(false)}
                className="modal-button cancel bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md"
              >
                No, Keep
              </IonButton>
            </div>
          </div>
        </IonModal>

        {/* Printable Bill Modal */}
        <IonModal isOpen={showBillModal} onDidDismiss={() => setShowBillModal(false)} ref={billModalRef}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Printable Bill</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowBillModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div dangerouslySetInnerHTML={{ __html: billContent }} />
            <IonButton
              expand="block"
              onClick={printBill}
              className="button-primary bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow-md uppercase tracking-wide mt-6"
            >
              <IonIcon icon={print} slot="start" /> Print Bill
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonApp>
  );
};

export default App;
