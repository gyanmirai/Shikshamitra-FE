const stduentData = {
    "studentId": "12345",
    "name": "John Doe",
     "paymentDate": "2024-05-01",
    "feeHeadListArray": [
      {
        "feeHead": "Tuition",
        "paymentTerm": "Annually",
        "totalAmount": 1200,
        "paymentStatus": [
          {
            "title": "2024-2025",
            "status": "Paid",
            "paymentMode": "Cash",
            "transactionId": "txn123",
           
          }
        ]
      },
      {
        "feeHead": "Sports",
        "paymentTerm": "Monthly",
        "totalAmount": 100,
        "paymentStatus": [
          {
            "title": "January",
            "status": "Unpaid",
            "paymentMode": "Cash",
            "transactionId": null,
          
          },
          {
            "title": "February",
            "status": "Paid",
            "paymentMode": "Cash",
            "transactionId": "txn124",
            
          }
        ]
      }
    ]
  }

  export default stduentData