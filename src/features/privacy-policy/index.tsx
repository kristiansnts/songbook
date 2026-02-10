import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function PrivacyPolicyPage() {
    const lastUpdated = 'February 10, 2026'

    return (
        <>
            <Header>
                <div className='flex flex-col gap-2'>
                    <h1 className='text-3xl font-bold tracking-tight'>Privacy Policy</h1>
                    <p className='text-muted-foreground'>
                        Last updated: {lastUpdated}
                    </p>
                </div>
            </Header>
            <Main>
                <ScrollArea className='h-full'>
                    <div className='mx-auto max-w-4xl space-y-6 pb-10'>
                        {/* Introduction */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Introduction</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    Welcome to Songbook. We are committed to protecting your
                                    privacy and ensuring transparency about how we collect, use,
                                    and safeguard your personal information. This Privacy Policy
                                    explains our practices regarding data collection and usage
                                    when you use our songbook management application.
                                </p>
                                <p className='text-muted-foreground'>
                                    By using Songbook, you agree to the collection and use of
                                    information in accordance with this policy. If you do not
                                    agree with our policies and practices, please do not use our
                                    application.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Information We Collect */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Information We Collect</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div>
                                    <h3 className='mb-2 font-semibold'>
                                        Personal Information You Provide
                                    </h3>
                                    <p className='mb-2 text-muted-foreground'>
                                        We collect information that you voluntarily provide when
                                        using our application:
                                    </p>
                                    <ul className='ml-6 list-disc space-y-1 text-muted-foreground'>
                                        <li>Account information (name, email address, password)</li>
                                        <li>Profile information (display name, preferences)</li>
                                        <li>
                                            Song data (titles, lyrics, artists, categories you create
                                            or manage)
                                        </li>
                                        <li>
                                            Playlist information (playlist names, song collections)
                                        </li>
                                        <li>
                                            User-generated content (comments, notes, annotations)
                                        </li>
                                    </ul>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className='mb-2 font-semibold'>
                                        Automatically Collected Information
                                    </h3>
                                    <p className='mb-2 text-muted-foreground'>
                                        When you use our application, we may automatically collect:
                                    </p>
                                    <ul className='ml-6 list-disc space-y-1 text-muted-foreground'>
                                        <li>
                                            Device information (device type, operating system,
                                            browser type)
                                        </li>
                                        <li>Usage data (pages visited, features used, timestamps)</li>
                                        <li>
                                            Log data (IP address, access times, error logs)
                                        </li>
                                        <li>
                                            Cookies and similar tracking technologies (session data,
                                            preferences)
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* How We Use Your Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>How We Use Your Information</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    We use the collected information for the following purposes:
                                </p>
                                <ul className='ml-6 list-disc space-y-2 text-muted-foreground'>
                                    <li>
                                        <strong>Service Provision:</strong> To provide, maintain,
                                        and improve our songbook management features
                                    </li>
                                    <li>
                                        <strong>Account Management:</strong> To create and manage
                                        your user account and authenticate your access
                                    </li>
                                    <li>
                                        <strong>Personalization:</strong> To customize your
                                        experience and remember your preferences
                                    </li>
                                    <li>
                                        <strong>Communication:</strong> To send you updates,
                                        notifications, and respond to your inquiries
                                    </li>
                                    <li>
                                        <strong>Security:</strong> To detect, prevent, and address
                                        technical issues and security threats
                                    </li>
                                    <li>
                                        <strong>Analytics:</strong> To understand how users interact
                                        with our application and improve functionality
                                    </li>
                                    <li>
                                        <strong>Legal Compliance:</strong> To comply with legal
                                        obligations and enforce our terms of service
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Data Storage and Security */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Storage and Security</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div>
                                    <h3 className='mb-2 font-semibold'>Data Storage</h3>
                                    <p className='text-muted-foreground'>
                                        Your data is stored securely using industry-standard
                                        practices. We use local storage for session management and
                                        secure servers for persistent data storage. Your password is
                                        encrypted and never stored in plain text.
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className='mb-2 font-semibold'>Security Measures</h3>
                                    <p className='mb-2 text-muted-foreground'>
                                        We implement appropriate technical and organizational
                                        measures to protect your personal information:
                                    </p>
                                    <ul className='ml-6 list-disc space-y-1 text-muted-foreground'>
                                        <li>Encryption of data in transit and at rest</li>
                                        <li>Regular security assessments and updates</li>
                                        <li>Access controls and authentication mechanisms</li>
                                        <li>Secure development practices</li>
                                    </ul>
                                    <p className='mt-2 text-muted-foreground'>
                                        However, no method of transmission over the internet or
                                        electronic storage is 100% secure. While we strive to use
                                        commercially acceptable means to protect your personal
                                        information, we cannot guarantee absolute security.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Sharing and Disclosure */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Sharing and Disclosure</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    We do not sell, trade, or rent your personal information to
                                    third parties. We may share your information only in the
                                    following circumstances:
                                </p>
                                <ul className='ml-6 list-disc space-y-2 text-muted-foreground'>
                                    <li>
                                        <strong>With Your Consent:</strong> When you explicitly
                                        authorize us to share specific information
                                    </li>
                                    <li>
                                        <strong>Service Providers:</strong> With trusted third-party
                                        service providers who assist in operating our application
                                        (hosting, analytics, customer support)
                                    </li>
                                    <li>
                                        <strong>Legal Requirements:</strong> When required by law,
                                        court order, or government regulation
                                    </li>
                                    <li>
                                        <strong>Business Transfers:</strong> In connection with a
                                        merger, acquisition, or sale of assets
                                    </li>
                                    <li>
                                        <strong>Protection of Rights:</strong> To protect our
                                        rights, property, or safety, or that of our users
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Your Rights and Choices */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Rights and Choices</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    You have the following rights regarding your personal
                                    information:
                                </p>
                                <ul className='ml-6 list-disc space-y-2 text-muted-foreground'>
                                    <li>
                                        <strong>Access:</strong> Request access to the personal
                                        information we hold about you
                                    </li>
                                    <li>
                                        <strong>Correction:</strong> Request correction of
                                        inaccurate or incomplete information
                                    </li>
                                    <li>
                                        <strong>Deletion:</strong> Request deletion of your personal
                                        information (subject to legal obligations)
                                    </li>
                                    <li>
                                        <strong>Data Portability:</strong> Request a copy of your
                                        data in a structured, machine-readable format
                                    </li>
                                    <li>
                                        <strong>Opt-Out:</strong> Opt-out of marketing
                                        communications at any time
                                    </li>
                                    <li>
                                        <strong>Account Closure:</strong> Delete your account and
                                        associated data through account settings
                                    </li>
                                </ul>
                                <p className='mt-4 text-muted-foreground'>
                                    To exercise any of these rights, please contact us using the
                                    information provided in the "Contact Us" section below.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Children's Privacy */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Children's Privacy</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    Our application is not intended for children under the age of
                                    13. We do not knowingly collect personal information from
                                    children under 13. If you are a parent or guardian and believe
                                    your child has provided us with personal information, please
                                    contact us immediately.
                                </p>
                                <p className='text-muted-foreground'>
                                    If we become aware that we have collected personal information
                                    from children under 13 without verification of parental
                                    consent, we will take steps to remove that information from
                                    our servers.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Cookies and Tracking */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cookies and Tracking Technologies</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    We use cookies and similar tracking technologies to track
                                    activity on our application and store certain information.
                                    Cookies are files with a small amount of data that may include
                                    an anonymous unique identifier.
                                </p>
                                <div>
                                    <h3 className='mb-2 font-semibold'>Types of Cookies We Use</h3>
                                    <ul className='ml-6 list-disc space-y-1 text-muted-foreground'>
                                        <li>
                                            <strong>Essential Cookies:</strong> Required for basic
                                            functionality and authentication
                                        </li>
                                        <li>
                                            <strong>Preference Cookies:</strong> Remember your
                                            settings and preferences (theme, language)
                                        </li>
                                        <li>
                                            <strong>Analytics Cookies:</strong> Help us understand how
                                            you use our application
                                        </li>
                                    </ul>
                                </div>
                                <p className='text-muted-foreground'>
                                    You can instruct your browser to refuse all cookies or to
                                    indicate when a cookie is being sent. However, if you do not
                                    accept cookies, you may not be able to use some portions of
                                    our application.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Third-Party Services */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Third-Party Services</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    Our application may contain links to third-party websites or
                                    services that are not operated by us. We have no control over
                                    and assume no responsibility for the content, privacy
                                    policies, or practices of any third-party sites or services.
                                </p>
                                <p className='text-muted-foreground'>
                                    We may use third-party service providers to help us operate
                                    our application and analyze usage. These third parties have
                                    access to your personal information only to perform specific
                                    tasks on our behalf and are obligated not to disclose or use
                                    it for any other purpose.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Data Retention */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Retention</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    We retain your personal information only for as long as
                                    necessary to fulfill the purposes outlined in this Privacy
                                    Policy, unless a longer retention period is required or
                                    permitted by law.
                                </p>
                                <p className='text-muted-foreground'>
                                    When you delete your account, we will delete or anonymize your
                                    personal information within a reasonable timeframe, except
                                    where we are required to retain it for legal, regulatory, or
                                    security purposes.
                                </p>
                            </CardContent>
                        </Card>

                        {/* International Data Transfers */}
                        <Card>
                            <CardHeader>
                                <CardTitle>International Data Transfers</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    Your information may be transferred to and maintained on
                                    computers located outside of your state, province, country, or
                                    other governmental jurisdiction where data protection laws may
                                    differ from those in your jurisdiction.
                                </p>
                                <p className='text-muted-foreground'>
                                    If you are located outside the country where our servers are
                                    located and choose to provide information to us, please note
                                    that we transfer the data to our servers and process it there.
                                    Your consent to this Privacy Policy followed by your
                                    submission of such information represents your agreement to
                                    that transfer.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Changes to Privacy Policy */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Changes to This Privacy Policy</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    We may update our Privacy Policy from time to time. We will
                                    notify you of any changes by posting the new Privacy Policy on
                                    this page and updating the "Last updated" date at the top of
                                    this policy.
                                </p>
                                <p className='text-muted-foreground'>
                                    We will notify you via email and/or a prominent notice within
                                    our application prior to the change becoming effective. You
                                    are advised to review this Privacy Policy periodically for any
                                    changes.
                                </p>
                                <p className='text-muted-foreground'>
                                    Changes to this Privacy Policy are effective when they are
                                    posted on this page. Your continued use of the application
                                    after any modifications indicates your acceptance of the
                                    updated Privacy Policy.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Contact Us */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Us</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    If you have any questions, concerns, or requests regarding
                                    this Privacy Policy or our data practices, please contact us:
                                </p>
                                <div className='rounded-lg bg-muted p-4'>
                                    <ul className='space-y-2 text-sm'>
                                        <li>
                                            <strong>Email:</strong>{' '}
                                            <a
                                                href='mailto:privacy@songbook.app'
                                                className='text-primary hover:underline'
                                            >
                                                privacy@songbook.app
                                            </a>
                                        </li>
                                        <li>
                                            <strong>Support:</strong>{' '}
                                            <a
                                                href='mailto:support@songbook.app'
                                                className='text-primary hover:underline'
                                            >
                                                support@songbook.app
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                <p className='text-sm text-muted-foreground'>
                                    We will respond to your inquiry within a reasonable timeframe,
                                    typically within 30 days.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Compliance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Compliance and Legal Basis</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <p className='text-muted-foreground'>
                                    We process your personal information in compliance with
                                    applicable data protection laws, including:
                                </p>
                                <ul className='ml-6 list-disc space-y-1 text-muted-foreground'>
                                    <li>
                                        General Data Protection Regulation (GDPR) for users in the
                                        European Economic Area
                                    </li>
                                    <li>
                                        California Consumer Privacy Act (CCPA) for California
                                        residents
                                    </li>
                                    <li>Other applicable regional data protection regulations</li>
                                </ul>
                                <p className='mt-4 text-muted-foreground'>
                                    Our legal basis for processing your personal information
                                    includes:
                                </p>
                                <ul className='ml-6 list-disc space-y-1 text-muted-foreground'>
                                    <li>
                                        <strong>Consent:</strong> When you have given explicit
                                        consent for specific processing activities
                                    </li>
                                    <li>
                                        <strong>Contract:</strong> When processing is necessary to
                                        perform our contract with you
                                    </li>
                                    <li>
                                        <strong>Legal Obligation:</strong> When we must process data
                                        to comply with legal requirements
                                    </li>
                                    <li>
                                        <strong>Legitimate Interests:</strong> When processing is
                                        necessary for our legitimate business interests
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Footer Note */}
                        <div className='rounded-lg border border-border bg-muted/50 p-6 text-center'>
                            <p className='text-sm text-muted-foreground'>
                                This Privacy Policy is designed to comply with Google Play Store
                                requirements and applicable data protection regulations. By
                                using Songbook, you acknowledge that you have read and
                                understood this Privacy Policy.
                            </p>
                        </div>
                    </div>
                </ScrollArea>
            </Main>
        </>
    )
}
