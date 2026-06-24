from django.test import TestCase
from django.contrib.auth.models import User
from django.core import mail
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

class EmailVerificationTests(APITestCase):

    def test_registration_and_verification_flow(self):
        # 1. Register a new user
        register_url = '/api/register/'
        data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'StrongPassword123!'
        }
        
        response = self.client.post(register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('Registration successful', response.data['message'])

        # Verify user is created but inactive
        user = User.objects.get(username='testuser')
        self.assertFalse(user.is_active)
        self.assertEqual(user.email, 'testuser@example.com')

        # 2. Check that the verification email was sent
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertEqual(sent_email.to, ['testuser@example.com'])
        self.assertIn('Verify your ZenTask account', sent_email.subject)

        # 3. Extract the verification URL params (uid and token) from the email body
        # Email body contains: ... verify-email?uid=<uid>&token=<token>
        email_body = sent_email.body
        self.assertIn('verify-email', email_body)
        
        # Parse the URL parameters from the body
        import urllib.parse
        parsed_url = urllib.parse.urlparse(email_body.split()[-1]) # get the URL from the end of the text
        query_params = urllib.parse.parse_qs(parsed_url.query)
        
        uid = query_params.get('uid')[0]
        token = query_params.get('token')[0]
        
        self.assertIsNotNone(uid)
        self.assertIsNotNone(token)

        # 4. Verify the email using the verify-email endpoint
        verify_url = '/api/verify-email/'
        verify_data = {
            'uid': uid,
            'token': token
        }
        verify_response = self.client.post(verify_url, verify_data, format='json')
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertIn('verified successfully', verify_response.data['message'])

        # Verify that the user is now active
        user.refresh_from_db()
        self.assertTrue(user.is_active)

