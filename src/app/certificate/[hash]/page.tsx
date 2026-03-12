import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import styles from '@/styles/certificate.module.css';
import { generateQRCode } from '@/lib/certificate';

export const metadata = {
    title: 'Identification/Certificate of Origin | Owerri Municipal',
};

function formatShortDate(date: Date | string | null) {
    if (!date) return '..........................';
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

export default async function CertificatePage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ hash: string }>;
    searchParams: Promise<{ print?: string }>;
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const hash = resolvedParams.hash;
    const shouldPrint = resolvedSearchParams?.print === 'true';

    // Find the application by its secure hash (using findFirst to avoid unique index req if schema is outdated locally)
    const application = await prisma.application.findFirst({
        where: { hash },
        include: {
            approvedBy: true,
            approvalChairman: true,
        },
    });

    if (!application || application.status !== 'APPROVED') {
        notFound();
    }

    // Generate QR code pointing to verification page
    const qrCodeDataUrl = await generateQRCode(hash);

    return (
        <div className={styles.certificatePage}>
            <div className={styles.certificateWrapper}>
                <div className={styles.actionPanel}>
                    <button
                        id="print-cert-btn"
                        type="button"
                        className="btn btn-primary btn-sm"
                        style={{ width: '120px' }}
                    >
                        Print
                    </button>
                    <script dangerouslySetInnerHTML={{ __html: `
                        document.getElementById('print-cert-btn').addEventListener('click', function() { window.print(); });
                        ${shouldPrint ? 'window.onload = function() { window.print(); };' : ''}
                    `}} />
                </div>

                <div className={styles.certificateBorder}>
                    {/* Background template and security layer */}
                    <div className={styles.backgroundTemplate} />
                    <div className={styles.securityPattern}>
                        {Array(1000).fill('ORIGINAL CERTIFICATE OWERRI MUNICIPAL COUNCIL VALID DOCUMENT ').join('')}
                    </div>
                    
                    <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Coat_of_arms_of_Nigeria.svg/300px-Coat_of_arms_of_Nigeria.svg.png"
                        alt="Watermark"
                        className={styles.watermark}
                    />

                    {/* Dynamic Field Overlays */}
                    <div className={styles.contentOverlay}>
                        
                        <div className={`${styles.field} ${styles.refNumber}`}>{application.referenceNo}</div>
                        <div className={`${styles.field} ${styles.issueDate}`}>{formatShortDate(application.approvedAt)}</div>
                        
                        <div className={`${styles.field} ${styles.bearerName}`}>{application.applicantName.toUpperCase()}</div>
                        <div className={`${styles.field} ${styles.nativeOf}`}>{application.nativeOf.toUpperCase()}</div>
                        
                        <div className={`${styles.field} ${styles.feeAmount}`}>5,000</div>
                        <div className={`${styles.field} ${styles.rcrNumber}`}>{application.paymentReference?.substring(0, 10) || 'ONLINE'}</div>
                        
                        {/* Split Date for the form footprint (Paid On ... 20...) */}
                        <div className={`${styles.field} ${styles.paidDateDay}`}>
                            {application.paidAt ? new Date(application.paidAt).getDate().toString().padStart(2, '0') : ''}
                        </div>
                        <div className={`${styles.field} ${styles.paidDateMonth}`}>
                            {application.paidAt ? new Date(application.paidAt).toLocaleString('en-US', { month: 'short' }) : ''}
                        </div>
                        <div className={`${styles.field} ${styles.paidDateYearDigit}`}>
                            {application.paidAt ? new Date(application.paidAt).getFullYear().toString().slice(-2) : ''}
                        </div>

                        {/* Signatures */}
                        {application.approvalChairman?.signatureUrl && (
                            <img
                                src={application.approvalChairman.signatureUrl}
                                alt="Chairman Signature"
                                className={styles.chairmanSignature}
                            />
                        )}
                        {/* Use Chairman signature for secretary as fallback for demo, or a specific secretary one if available */}
                        {application.approvalChairman?.signatureUrl && (
                            <img
                                src={application.approvalChairman.signatureUrl}
                                alt="Secretary Signature"
                                className={styles.secretarySignature}
                            />
                        )}

                        {/* Digital Proof section */}
                        <div className={styles.digitalSecurityBox}>
                            <img src={qrCodeDataUrl} alt="QR Code" className={styles.qrCode} />
                            <div className={styles.securityText}>
                                <strong>Authentic Digital Record</strong><br />
                                Scan QR code to verify this certificate on<br />
                                the official state portal.<br />
                                Tampering voids validity.
                            </div>
                        </div>
                        
                        {/* SHA-256 derived Document Code */}
                        <div className={styles.documentCode}>
                            Doc Code: {application.hash ? application.hash.substring(0, 8).toUpperCase() : 'N/A'}
                        </div>
                        
                        {/* Issuance Timestamp */}
                        <div className={styles.timestamp}>
                            Issued: {application.approvedAt ? new Date(application.approvedAt).toLocaleDateString('en-GB') : 'N/A'}<br/>
                            Time: {application.approvedAt ? new Date(application.approvedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' WAT' : 'N/A'}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
