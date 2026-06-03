import razorpay

client = razorpay.Client(auth=('rzp_test_SlyeZSQVRS6kuk', 'Qt1G3eLwSAFA8l5bHEHm69ct'))

try:
    # Test creating a simple order
    order = client.order.create({
        'amount': 100,
        'currency': 'INR',
        'payment_capture': '1'
    })
    print('✓ Razorpay credentials are valid!')
    print(f'Order created: {order["id"]}')
except Exception as e:
    print(f'✗ Razorpay credentials are invalid: {e}')
