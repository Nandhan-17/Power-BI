// Dynamic CSV string generators for quick 1-click testing in the Upload Portal

export function generateSampleGroceryCsv(): { fileName: string; content: string } {
  const content = `order_id,order_date,customer_name,category,product_name,city,quantity,sales_amount
ORD-1001,2024-09-01,Ananya Sharma,Fresh Vegetables,Organic Tomatoes,Mumbai,3,150.00
ORD-1002,2024-09-01,Rahul Verma,Dairy & Eggs,A2 Cow Milk 1L,Bengaluru,2,140.00
ORD-1003,2024-09-02,Priya Patel,Bakery,Whole Wheat Bread,Delhi,1,55.00
ORD-1004,2024-09-02,Amit Kumar,Fresh Fruits,Royal Gala Apples 1kg,Mumbai,2,360.00
ORD-1005,2024-09-03,Sneha Gupta,Snacks & Munchies,Roasted Makhana 100g,Bengaluru,4,480.00
ORD-1006,2024-09-03,Vikram Singh,Beverages,Cold Pressed Orange Juice,Delhi,2,198.00
ORD-1007,2024-09-04,Ananya Sharma,Fresh Vegetables,Hydroponic Spinach 250g,Mumbai,2,90.00
ORD-1008,2024-09-04,Rohan Mehta,Dairy & Eggs,Greek Yogurt Blueberry,Hyderabad,3,270.00
ORD-1009,2024-09-05,Neha Joshi,Instant Food,Atta Noodles Pack,Pune,5,225.00
ORD-1010,2024-09-05,Rahul Verma,Snacks & Munchies,Dark Chocolate 70%,Bengaluru,2,350.00
ORD-1011,2024-09-06,Kavita Rao,Fresh Fruits,Alphonso Mangoes 1kg,Mumbai,1,450.00
ORD-1012,2024-09-06,Amit Kumar,Beverages,Sparkling Coconut Water,Delhi,4,240.00
ORD-1013,2024-09-07,Suresh Nair,Bakery,Artisanal Sourdough,Chennai,1,180.00
ORD-1014,2024-09-07,Priya Patel,Dairy & Eggs,Paneer 200g,Delhi,2,190.00
ORD-1015,2024-09-08,Sneha Gupta,Fresh Vegetables,Avocado Pack of 2,Bengaluru,2,299.00
ORD-1016,2024-09-08,Rohan Mehta,Snacks & Munchies,Almond Energy Bars,Hyderabad,3,315.00
ORD-1017,2024-09-09,Neha Joshi,Instant Food,Ready Meals Dal Makhani,Pune,2,220.00
ORD-1018,2024-09-09,Kavita Rao,Fresh Fruits,Blueberries 125g,Mumbai,2,398.00`;

  return { fileName: 'Blinkit_Grocery_Sales_Q3.csv', content };
}

export function generateSampleTechCsv(): { fileName: string; content: string } {
  const content = `transaction_id,timestamp,user_id,product_category,title,location,units,total_amount
TXN-901,2024-09-01,USR-441,Laptops,MacBook Air M3,Bengaluru,1,114900.00
TXN-902,2024-09-01,USR-442,Audio,Sony WH-1000XM5,Mumbai,1,29990.00
TXN-903,2024-09-02,USR-443,Smartphones,iPhone 15 Pro,Delhi,1,134900.00
TXN-904,2024-09-03,USR-444,Wearables,Apple Watch Series 9,Hyderabad,2,83800.00
TXN-905,2024-09-03,USR-445,Monitors,Dell UltraSharp 27 4K,Pune,1,45500.00
TXN-906,2024-09-04,USR-446,Audio,AirPods Pro 2nd Gen,Bengaluru,2,49800.00
TXN-907,2024-09-05,USR-447,Smartphones,Samsung Galaxy S24 Ultra,Mumbai,1,129999.00
TXN-908,2024-09-06,USR-448,Accessories,Logitech MX Master 3S,Chennai,3,29970.00
TXN-909,2024-09-07,USR-449,Laptops,Asus ROG Zephyrus G14,Delhi,1,164990.00
TXN-910,2024-09-08,USR-450,Wearables,Galaxy Watch 6,Pune,2,59980.00`;

  return { fileName: 'Tech_Electronics_Orders_2024.csv', content };
}

export function generateSampleFashionCsv(): { fileName: string; content: string } {
  const content = `invoice_id,invoice_date,client_id,department,item,city,qty,revenue
INV-501,2024-09-01,CLI-88,Men Outerwear,Denim Jacket Vintage,Delhi,1,4999.00
INV-502,2024-09-02,CLI-89,Women Dresses,Floral Summer Midi Dress,Mumbai,2,5998.00
INV-503,2024-09-02,CLI-90,Footwear,Leather Chelsea Boots,Bengaluru,1,6499.00
INV-504,2024-09-03,CLI-91,Accessories,Minimalist Leather Tote,Delhi,1,3499.00
INV-505,2024-09-04,CLI-92,Men Activewear,Performance Running Shorts,Hyderabad,3,3897.00
INV-506,2024-09-05,CLI-93,Women Knitwear,Cashmere Crewneck Sweater,Pune,1,7999.00
INV-507,2024-09-06,CLI-94,Footwear,Chunky Platform Sneakers,Mumbai,2,8998.00
INV-508,2024-09-07,CLI-95,Men Shirts,Linen Button-Down Shirt,Bengaluru,2,5198.00`;

  return { fileName: 'Fashion_Apparel_Sales_Report.csv', content };
}

export function generateMinimalMissingColumnCsv(): { fileName: string; content: string } {
  const content = `product_name,sales_amount
Organic Honey 500g,450.00
Wildflower Honey 250g,280.00
Raw Artisan Honey,620.00
Royal Jelly Supplement,1250.00
Honey Dip Sticks 5pk,150.00`;

  return { fileName: 'Minimal_Honey_Sales_No_Date_Or_Category.csv', content };
}
