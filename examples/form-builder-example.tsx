import React from 'react'
import { FormBuilder, FormRenderer, Text, Email, Password, Select, Checkbox } from '@/components/builders'
import { z } from 'zod'

export function FormBuilderExample() {
  const formConfig = FormBuilder.create()
    .title('User Registration')
    .description('Create a new user account')
    .section(section => 
      section
        .title('Personal Information')
        .description('Please provide your basic information')
        .columns(2)
        .field('firstName', field => 
          field
            .label('First Name')
            .type('text')
            .placeholder('Enter your first name')
            .required()
            .validation(z.string().min(2, 'First name must be at least 2 characters'))
        )
        .field('lastName', field => 
          field
            .label('Last Name')
            .type('text')
            .placeholder('Enter your last name')
            .required()
            .validation(z.string().min(2, 'Last name must be at least 2 characters'))
        )
        .field('email', field => 
          field
            .label('Email Address')
            .type('email')
            .placeholder('Enter your email')
            .required()
            .validation(z.string().email('Please enter a valid email address'))
        )
        .field('phone', field => 
          field
            .label('Phone Number')
            .type('phone')
            .placeholder('+1 (555) 123-4567')
            .helperText('Include country code')
        )
    )
    .section(section => 
      section
        .title('Account Details')
        .description('Set up your account credentials')
        .field('username', field => 
          field
            .label('Username')
            .type('text')
            .placeholder('Choose a username')
            .required()
            .validation(z.string().min(3, 'Username must be at least 3 characters'))
        )
        .field('password', field => 
          field
            .label('Password')
            .type('password')
            .placeholder('Create a secure password')
            .required()
            .validation(z.string().min(8, 'Password must be at least 8 characters'))
        )
        .field('confirmPassword', field => 
          field
            .label('Confirm Password')
            .type('password')
            .placeholder('Confirm your password')
            .required()
        )
        .field('role', field => 
          field
            .label('Role')
            .type('select')
            .placeholder('Select a role')
            .options([
              { label: 'Admin', value: 'admin' },
              { label: 'User', value: 'user' },
              { label: 'Manager', value: 'manager' },
            ])
            .required()
        )
    )
    .section(section => 
      section
        .title('Preferences')
        .collapsible(true)
        .field('newsletter', field => 
          field
            .label('Subscribe to newsletter')
            .type('checkbox')
            .description('Receive updates about new features and promotions')
        )
        .field('notifications', field => 
          field
            .label('Enable notifications')
            .type('checkbox')
            .description('Get notified about important account activity')
        )
    )
    .submitButtonText('Create Account')
    .cancelButtonText('Cancel')
    .onSubmit(async (data) => {
      console.log('Form submitted:', data)
      // Handle form submission
    })
    .build()

  return (
    <div className="max-w-2xl mx-auto p-6">
      <FormRenderer config={formConfig} />
    </div>
  )
}

// Alternative using fluent helper functions
export function FluentFormExample() {
  const formConfig = FormBuilder.create()
    .title('Quick User Form')
    .schema([
      Text('firstName')
        .label('First Name')
        .placeholder('Enter first name')
        .required()
        .build(),
      
      Text('lastName')
        .label('Last Name')
        .placeholder('Enter last name')
        .required()
        .build(),
      
      Email('email')
        .label('Email')
        .placeholder('Enter email address')
        .required()
        .build(),
      
      Password('password')
        .label('Password')
        .placeholder('Create password')
        .required()
        .minLength(8)
        .build(),
      
      Select('role')
        .label('Role')
        .placeholder('Select role')
        .options([
          { label: 'Admin', value: 'admin' },
          { label: 'User', value: 'user' },
        ])
        .required()
        .build(),
      
      Checkbox('terms')
        .label('I agree to the terms and conditions')
        .description('You must agree to proceed')
        .required()
        .build(),
    ])
    .submitButtonText('Submit')
    .onSubmit(async (data) => {
      console.log('Fluent form submitted:', data)
    })
    .build()

  return (
    <div className="max-w-lg mx-auto p-6">
      <FormRenderer config={formConfig} />
    </div>
  )
}