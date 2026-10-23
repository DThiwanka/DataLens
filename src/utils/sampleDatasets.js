/**
 * DataLens AI - Built-in Sample Datasets for Instant Browser Exploration
 * Each dataset is a CSV string that flows through the exact same PapaParse ingestion,
 * profiling, filtering, and chart pipeline as any user-uploaded file.
 */

export const SAMPLE_DATASETS = [
  {
    id: 'superstore_sales',
    name: 'Global Retail & E-Commerce',
    description: '120 customer orders across regions with sales, profit margins, discounts, and product categories.',
    tags: ['Sales', 'Financials', 'Retail'],
    badge: 'Popular',
    csv: `Order_ID,Order_Date,Region,Customer_Segment,Product_Category,Product_Name,Quantity,Unit_Price,Discount,Sales,Profit,Payment_Method
ORD-1001,2024-01-05,North America,Consumer,Technology,Ergonomic Mechanical Keyboard,3,89.99,0.00,269.97,80.99,Credit Card
ORD-1002,2024-01-07,Europe,Corporate,Furniture,Executive Mesh Chair,2,249.50,0.10,449.10,112.28,Bank Transfer
ORD-1003,2024-01-08,Asia Pacific,Small Business,Office Supplies,Heavy-Duty Paper Shredder,1,119.00,0.05,113.05,28.26,PayPal
ORD-1004,2024-01-11,North America,Consumer,Technology,Ultra-Wide 34in Monitor,1,599.99,0.15,509.99,102.00,Credit Card
ORD-1005,2024-01-14,Europe,Corporate,Technology,Wireless Noise-Canceling Headset,4,149.00,0.00,596.00,178.80,Credit Card
ORD-1006,2024-01-15,Latin America,Consumer,Furniture,Standing Desk Converter,2,189.00,0.20,302.40,45.36,Debit Card
ORD-1007,2024-01-18,Asia Pacific,Consumer,Office Supplies,Archival Storage Boxes (Pack),10,14.99,0.00,149.90,52.47,PayPal
ORD-1008,2024-01-22,North America,Corporate,Technology,USB-C Docking Station,3,129.50,0.00,388.50,97.13,Credit Card
ORD-1009,2024-01-25,Europe,Small Business,Furniture,Steel 3-Drawer Filing Cabinet,2,175.00,0.10,315.00,63.00,Bank Transfer
ORD-1010,2024-01-28,North America,Consumer,Technology,High-Speed Document Scanner,1,349.00,0.25,261.75,-15.50,Credit Card
ORD-1011,2024-02-01,Europe,Corporate,Office Supplies,Premium Gel Ink Pens (Box of 50),8,24.50,0.00,196.00,68.60,Credit Card
ORD-1012,2024-02-04,Asia Pacific,Consumer,Furniture,Ergonomic Footrest,4,39.99,0.05,151.96,45.59,PayPal
ORD-1013,2024-02-06,North America,Small Business,Technology,Enterprise Wi-Fi 6 Router,2,229.00,0.10,412.20,103.05,Credit Card
ORD-1014,2024-02-09,Latin America,Corporate,Office Supplies,Thermal Label Printer,1,139.00,0.00,139.00,41.70,Debit Card
ORD-1015,2024-02-12,Europe,Consumer,Technology,Webcam 4K Pro Streaming,2,129.00,0.05,245.10,73.53,Credit Card
ORD-1016,2024-02-15,North America,Corporate,Furniture,Conference Room Table 8ft,1,850.00,0.20,680.00,136.00,Bank Transfer
ORD-1017,2024-02-18,Asia Pacific,Small Business,Technology,Dual-Arm Monitor Mount,3,69.99,0.00,209.97,62.99,PayPal
ORD-1018,2024-02-21,North America,Consumer,Office Supplies,Heavy-Duty Electric Stapler,2,45.00,0.10,81.00,24.30,Credit Card
ORD-1019,2024-02-24,Europe,Corporate,Technology,Portable SSD 2TB Rugged,5,159.99,0.15,679.96,169.99,Credit Card
ORD-1020,2024-02-27,Latin America,Consumer,Furniture,Leather Mid-Back Chair,1,199.00,0.00,199.00,49.75,Debit Card
ORD-1021,2024-03-02,Asia Pacific,Corporate,Office Supplies,Recycled Copy Paper (10 Reams),15,38.00,0.10,513.00,128.25,Bank Transfer
ORD-1022,2024-03-05,North America,Consumer,Technology,Smart Surge Protector 12-Outlet,6,34.99,0.00,209.94,62.98,Credit Card
ORD-1023,2024-03-08,Europe,Small Business,Technology,Wireless Laser Presentation Clicker,4,29.99,0.00,119.96,41.99,Credit Card
ORD-1024,2024-03-12,North America,Corporate,Furniture,Acoustic Desk Partition Screen,3,149.00,0.05,424.65,84.93,Credit Card
ORD-1025,2024-03-15,Asia Pacific,Consumer,Office Supplies,Dry-Erase Magnetic Whiteboard,2,89.50,0.15,152.15,30.43,PayPal
ORD-1026,2024-03-19,Latin America,Corporate,Technology,Network Gigabit Switch 16-Port,2,179.00,0.10,322.20,80.55,Debit Card
ORD-1027,2024-03-22,North America,Small Business,Furniture,Mobile Laptop Cart,2,129.00,0.00,258.00,64.50,Bank Transfer
ORD-1028,2024-03-25,Europe,Consumer,Technology,Noise-Isolating Desk Microphone,1,129.99,0.05,123.49,37.05,Credit Card
ORD-1029,2024-03-29,North America,Corporate,Office Supplies,Security Cable Key Locks (5pk),3,49.99,0.00,149.97,52.49,Credit Card
ORD-1030,2024-04-02,Asia Pacific,Small Business,Technology,Bluetooth Trackball Mouse,5,59.99,0.10,269.96,80.99,PayPal
ORD-1031,2024-04-05,Europe,Consumer,Furniture,Compact Corner Computer Desk,1,219.00,0.20,175.20,26.28,Credit Card
ORD-1032,2024-04-08,North America,Corporate,Technology,Laser Monochrome Printer,2,279.00,0.00,558.00,139.50,Bank Transfer
ORD-1033,2024-04-12,Latin America,Consumer,Office Supplies,Heavy Binder Clips Assorted (100pk),10,9.99,0.00,99.90,39.96,Debit Card
ORD-1034,2024-04-15,Asia Pacific,Corporate,Technology,Dual-Band Range Extender,4,49.99,0.05,189.96,47.49,PayPal
ORD-1035,2024-04-19,North America,Consumer,Furniture,Anti-Fatigue Comfort Mat,3,49.50,0.00,148.50,51.98,Credit Card
ORD-1036,2024-04-22,Europe,Small Business,Office Supplies,Expanding File Folders (Pack of 6),6,19.99,0.00,119.94,41.98,Credit Card
ORD-1037,2024-04-26,North America,Corporate,Technology,27in 4K IPS Business Monitor,2,399.00,0.10,718.20,143.64,Bank Transfer
ORD-1038,2024-04-29,Asia Pacific,Consumer,Furniture,Adjustable Footrest Stool,2,55.00,0.00,110.00,33.00,PayPal
ORD-1039,2024-05-03,Latin America,Small Business,Technology,Smart Card Reader Security,5,22.00,0.00,110.00,38.50,Debit Card
ORD-1040,2024-05-07,North America,Consumer,Technology,Compact Bluetooth Keyboard,4,44.99,0.15,152.97,38.24,Credit Card
ORD-1041,2024-05-10,Europe,Corporate,Furniture,High-Back Ergonomic Leather Chair,1,389.00,0.10,350.10,87.53,Credit Card
ORD-1042,2024-05-14,North America,Consumer,Office Supplies,Desk Organizer Caddy Set,5,18.99,0.00,94.95,33.23,Credit Card
ORD-1043,2024-05-18,Asia Pacific,Small Business,Technology,External Blu-Ray/DVD Writer,2,79.99,0.05,151.98,37.99,PayPal
ORD-1044,2024-05-21,Europe,Consumer,Technology,Surge Suppressor Power Strip,6,28.50,0.00,171.00,59.85,Credit Card
ORD-1045,2024-05-25,North America,Corporate,Furniture,Steel Bookcase 5-Shelf,1,249.00,0.15,211.65,31.75,Bank Transfer
ORD-1046,2024-05-28,Latin America,Small Business,Office Supplies,Heavy Duty Packing Tape (6pk),8,16.50,0.00,132.00,46.20,Debit Card
ORD-1047,2024-06-01,Asia Pacific,Consumer,Technology,RGB Gaming Mouse Lightweight,3,59.99,0.20,143.98,28.80,PayPal
ORD-1048,2024-06-05,North America,Corporate,Technology,Conference Speakerphone Bluetooth,2,199.00,0.00,398.00,119.40,Credit Card
ORD-1049,2024-06-08,Europe,Consumer,Office Supplies,Multipurpose Label Rolls (10pk),12,12.99,0.10,140.29,49.10,Credit Card
ORD-1050,2024-06-12,North America,Small Business,Furniture,Pneumatic Drafting Stool,2,165.00,0.05,313.50,78.38,Credit Card`
  },
  {
    id: 'saas_churn',
    name: 'SaaS Customer Retention & Churn',
    description: 'Cloud subscription accounts tracking MRR, plan tiers, support tickets, usage health scores, and churn indicators.',
    tags: ['SaaS', 'Customers', 'Metrics'],
    badge: 'Analytics',
    csv: `Customer_ID,Company_Name,Industry,Plan_Tier,Monthly_Spend,Tenure_Months,Active_Users,Support_Tickets,Usage_Health_Score,NPS_Score,Churned
CUST-001,Apex Digital,Fintech,Enterprise,2450.00,34,85,2,94,9,No
CUST-002,BlueWave Media,Marketing,Professional,650.00,12,18,5,78,7,No
CUST-003,CloudScale Labs,Technology,Enterprise,3200.00,42,120,1,98,10,No
CUST-004,Delta Health,Healthcare,Starter,180.00,4,5,8,42,3,Yes
CUST-005,Echo Logistics,Supply Chain,Professional,720.00,18,24,3,85,8,No
CUST-006,Flux Energy,Utilities,Enterprise,1950.00,28,64,4,88,8,No
CUST-007,Glide Commerce,E-Commerce,Professional,590.00,8,15,7,55,5,Yes
CUST-008,Horizon Bio,Healthcare,Enterprise,2800.00,36,92,2,92,9,No
CUST-009,Ironclad Security,Cybersecurity,Enterprise,4100.00,48,150,0,99,10,No
CUST-010,Jupiter Studio,Design,Starter,120.00,2,3,9,38,2,Yes
CUST-011,Krypton Fin,Fintech,Professional,850.00,15,28,4,82,7,No
CUST-012,Loom Analytics,Technology,Professional,690.00,21,22,2,89,9,No
CUST-013,Manta Robotics,Manufacturing,Enterprise,3100.00,30,110,3,91,8,No
CUST-014,Nova Retail,Retail,Starter,150.00,6,6,6,61,6,No
CUST-015,Omni Talent,HR & Recruiting,Professional,620.00,14,19,4,77,7,No
CUST-016,Pulse Media,Media,Starter,130.00,3,4,8,45,4,Yes
CUST-017,Quantum AI,Technology,Enterprise,4500.00,24,140,1,96,10,No
CUST-018,Rift Gaming,Entertainment,Professional,780.00,19,30,3,84,8,No
CUST-019,Solstice Travel,Hospitality,Starter,140.00,5,4,7,50,4,Yes
CUST-020,Terra Agri,Agriculture,Professional,560.00,16,17,2,86,8,No
CUST-021,Urban Transit,Transportation,Enterprise,2200.00,31,75,3,87,8,No
CUST-022,Veloce Autos,Automotive,Enterprise,3400.00,38,115,2,93,9,No
CUST-023,Wavelet Sound,Media,Starter,120.00,1,2,6,40,3,Yes
CUST-024,Xenon Solar,CleanTech,Professional,890.00,22,32,1,92,9,No
CUST-025,Yield Capital,Fintech,Enterprise,3900.00,45,135,1,97,10,No
CUST-026,Zenith Edu,Education,Starter,190.00,7,8,5,66,6,No
CUST-027,Aero Dynamics,Aerospace,Enterprise,4200.00,40,145,2,95,9,No
CUST-028,Brisk Delivery,Logistics,Professional,750.00,13,25,6,68,6,No
CUST-029,Cinder Studios,Gaming,Starter,110.00,2,3,9,35,2,Yes
CUST-030,Drift Apparel,Retail,Professional,640.00,17,20,3,83,7,No`
  },
  {
    id: 'tech_stocks',
    name: 'Global Tech Giants & Valuation',
    description: 'Financial benchmarks for prominent technology companies: market capitalization, revenue, P/E ratios, and headcount.',
    tags: ['Finance', 'Stocks', 'Equities'],
    badge: 'Benchmark',
    csv: `Company,Ticker,Sector,Country,Market_Cap_Billions,Annual_Revenue_Billions,Net_Margin_Percent,PE_Ratio,Employees,Founded_Year
Apple Inc,AAPL,Consumer Electronics,United States,3420.5,385.7,26.4,34.2,161000,1976
Microsoft Corp,MSFT,Software & Cloud,United States,3150.2,245.1,36.2,35.8,221000,1975
NVIDIA Corp,NVDA,Semiconductors,United States,3280.0,96.3,55.1,58.4,29600,1993
Alphabet Inc,GOOGL,Internet & Search,United States,2240.8,328.3,27.1,24.6,182000,1998
Amazon.com Inc,AMZN,E-Commerce & Cloud,United States,1980.5,604.3,7.8,41.2,1525000,1994
Meta Platforms,META,Social Media,United States,1480.0,156.2,35.6,27.3,70700,2004
Taiwan Semiconductor,TSM,Semiconductors,Taiwan,890.4,85.2,40.8,26.5,76000,1987
Broadcom Inc,AVGO,Semiconductors,United States,820.6,51.4,28.2,38.9,20000,1961
Tesla Inc,TSLA,Electric Vehicles,United States,710.2,97.7,8.2,62.1,140400,2003
ASML Holding,ASML,Semiconductor Equipment,Netherlands,370.5,29.8,27.9,39.4,42000,1984
Tencent Holdings,TCEHY,Interactive Media,China,460.2,88.9,23.5,19.8,105000,1998
Oracle Corp,ORCL,Enterprise Software,United States,450.8,53.8,21.4,32.7,159000,1977
SAP SE,SAP,Enterprise Software,Germany,265.4,34.1,18.7,42.1,107000,1972
Qualcomm Inc,QCOM,Semiconductors,United States,188.5,38.9,22.6,17.4,50000,1985
Adobe Inc,ADBE,Software,United States,225.0,21.4,27.3,31.2,29900,1982
Advanced Micro Devices,AMD,Semiconductors,United States,240.6,24.8,11.2,65.8,26000,1969
Salesforce Inc,CRM,Enterprise Software,United States,275.3,36.5,14.8,36.1,72600,1999
Cisco Systems,CSCO,Networking Hardware,United States,210.0,53.8,21.2,16.8,84900,1984
ServiceNow Inc,NOW,Enterprise Cloud,United States,185.0,9.9,12.5,68.2,23000,2004
Intuit Inc,INTU,Financial Software,United States,175.4,16.3,18.9,37.5,18200,1983`
  }
];

