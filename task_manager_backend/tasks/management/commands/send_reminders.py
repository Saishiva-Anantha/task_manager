from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from tasks.models import Task
import datetime

class Command(BaseCommand):
    help = 'Sends email reminders for tasks due within the next 24 hours'

    def handle(self, *args, **kwargs):
        now = timezone.now().date()
        tomorrow = now + datetime.timedelta(days=1)

        # Find incomplete tasks due tomorrow (or earlier) that haven't had a reminder sent
        tasks = Task.objects.filter(
            completed=False,
            reminder_sent=False,
            due_date__lte=tomorrow,
            due_date__gte=now,
            user__isnull=False
        ).select_related('user')

        count = 0
        for task in tasks:
            user = task.user
            if user and user.email:
                try:
                    send_mail(
                        subject=f'Reminder: Task "{task.title}" is due soon!',
                        message=f'Hi {user.username},\n\nThis is a friendly reminder that your task "{task.title}" is due on {task.due_date}.\n\nPlease log in to Anantha Task Manager to complete it!\n\nBest,\nAnantha Task Manager Team',
                        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@ananthataskmanager.com'),
                        recipient_list=[user.email],
                        fail_silently=False,
                    )
                    task.reminder_sent = True
                    task.save()
                    count += 1
                    self.stdout.write(self.style.SUCCESS(f'Sent reminder to {user.email} for task "{task.title}"'))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Failed to send email to {user.email}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'Successfully sent {count} reminders.'))
