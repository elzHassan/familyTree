import { Component } from '@angular/core';
import { FamilyMember } from './family-tree/family-tree.component';

@Component({
  selector: 'app-root',
  template: `
    <app-family-tree [data]="familyData"></app-family-tree>
  `
})
export class AppComponent {
  familyData: FamilyMember = {
    id: '1',
    name: 'George Smith',
    photoUrl: 'https://i.pravatar.cc/150?img=1',
    photos: [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3'
    ],
    birthDate: '1940-03-15',
    gender: 'male' as 'male',
    occupation: 'Retired Engineer',
    location: 'Boston, MA',
    about: 'Family patriarch with a passion for engineering and innovation. Spent 40 years working in aerospace.',
    email: 'george.smith@email.com',
    phone: '+1 (555) 123-4567',
    spouse: {
      name: 'Martha Smith',
      photoUrl: 'https://i.pravatar.cc/150?img=20',
      birthDate: '1942-06-20',
      marriageDate: '1964-08-12'
    },
    children: [
      {
        id: '2',
        name: 'John Smith',
        photoUrl: 'https://i.pravatar.cc/150?img=3',
        birthDate: '1965-07-22',
        gender: 'male' as 'male',
        occupation: 'Software Engineer',
        location: 'New York, NY',
        children: [
          {
            id: '5',
            name: 'Michael Smith',
            photoUrl: 'https://i.pravatar.cc/150?img=11',
            birthDate: '1990-01-12',
            gender: 'male' as 'male',
            occupation: 'Doctor',
            location: 'Chicago, IL',
            children: []
          }
        ]
      },
      {
        id: '3',
        name: 'Mary Wilson',
        photoUrl: 'https://i.pravatar.cc/150?img=4',
        birthDate: '1968-12-03',
        gender: 'female' as 'female',
        occupation: 'Teacher',
        location: 'Los Angeles, CA',
        children: []
      }
      // ... rest of the family tree
    ]
  };
}
