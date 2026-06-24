from django.test import TestCase
from django.contrib.auth.models import User
from .models import Category, Task
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


class ProjectAndCollaborationTests(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username='collab1', email='c1@test.com', password='password123')
        self.user2 = User.objects.create_user(username='collab2', email='c2@test.com', password='password123')
        self.client.force_authenticate(user=self.user1)

    def test_project_lifecycle_and_invite(self):
        # 1. Create a project
        url = '/api/projects/'
        response = self.client.post(url, {'name': 'Team Alpha', 'member_ids': []})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        project_id = response.data['id']
        
        # Verify creator is added as a member
        self.assertIn(self.user1.id, [m['id'] for m in response.data['members']])
        
        # 2. Invite user2
        invite_url = f'/api/projects/{project_id}/invite/'
        invite_response = self.client.post(invite_url, {'username': 'collab2'})
        self.assertEqual(invite_response.status_code, status.HTTP_200_OK)
        self.assertIn('Successfully invited', invite_response.data['message'])

        # 3. Check activity log exists
        activity_url = '/api/activities/'
        act_response = self.client.get(activity_url)
        self.assertEqual(act_response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(act_response.data) >= 2) # project_created and project_invite


class AnalyticsAndAITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='tester', email='t@test.com', password='password123')
        self.client.force_authenticate(user=self.user)
        # Create some tasks
        self.cat = Category.objects.create(name='Dev', user=self.user)
        import datetime
        today_str = datetime.date.today().strftime('%Y-%m-%d')
        Task.objects.create(title='T1', completed=True, priority='high', user=self.user, category=self.cat, due_date=today_str)
        Task.objects.create(title='T2', completed=False, priority='medium', user=self.user, category=self.cat)

    def test_analytics(self):
        response = self.client.get('/api/analytics/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_completed'], 1)
        self.assertEqual(response.data['total_pending'], 1)
        self.assertEqual(response.data['productivity_score'], 50)
        self.assertEqual(response.data['by_priority']['high'], 1)
        self.assertEqual(response.data['by_category']['Dev'], 2)

    def test_ai_task_generation_fallback(self):
        # Trigger generation using fallback
        response = self.client.post('/api/ai-generate/', {'prompt': 'Learn Django app'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data['tasks']), 5)
        # Verify category was created
        self.assertTrue(Category.objects.filter(name__startswith='AI:').exists())

