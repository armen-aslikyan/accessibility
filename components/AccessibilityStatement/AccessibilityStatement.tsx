'use client';

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './AccessibilityStatement.css';

interface StatementData {
  siteName: string;
  organizationName: string;
  complianceStatus: 'totalement' | 'partiellement' | 'non';
  complianceRate: number;
  auditDate: string;
  auditorName: string;
  technologies: string[];
  testEnvironment: string[];
  nonCompliantItems: string[];
  contactEmail: string;
  contactFormUrl: string;
}

type TFunc = (key: string, options?: Record<string, unknown>) => string;

function StatementContent({ tFunc, data }: { tFunc: TFunc; data: StatementData }) {
  const {
    siteName,
    organizationName,
    complianceStatus,
    complianceRate,
    auditDate,
    auditorName,
    technologies,
    testEnvironment,
    nonCompliantItems,
    contactFormUrl,
    contactEmail,
  } = data;

  return (
    <>
      <h1>{tFunc('statement.title')}</h1>
      <p>
        <strong>{organizationName}</strong> {tFunc('statement.intro')}
      </p>
      <p>
        {tFunc('statement.appliesTo')} <strong>{siteName}</strong>.
      </p>

      <section>
        <h2>{tFunc('statement.complianceTitle')}</h2>
        <p>
          {siteName}{' '}
          {tFunc('statement.complianceText', {
            status: tFunc(`statement.statusLabels.${complianceStatus}`),
          })}
        </p>
        {complianceRate && (
          <p>{tFunc('statement.complianceRate', { rate: complianceRate })}</p>
        )}
      </section>

      <section>
        <h2>{tFunc('statement.testResultsTitle')}</h2>
        <p>
          {tFunc('statement.testResultsIntro', { auditor: auditorName, date: auditDate })}
        </p>
        <ul>
          {nonCompliantItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{tFunc('statement.technologiesTitle')}</h2>
        <ul>
          {technologies.map((tech, index) => (
            <li key={index}>{tech}</li>
          ))}
        </ul>
        <h3>{tFunc('statement.testEnvironmentTitle')}</h3>
        <p>{tFunc('statement.testEnvironmentIntro')}</p>
        <ul>
          {testEnvironment.map((env, index) => (
            <li key={index}>{env}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{tFunc('statement.contactTitle')}</h2>
        <p>{tFunc('statement.contactIntro', { siteName })}</p>
        <ul>
          <li>
            {tFunc('statement.contactSendMessage')}{' '}
            <a href={contactFormUrl}>{tFunc('statement.contactFormLink')}</a>
          </li>
          <li>
            {tFunc('statement.contactEmail')} {contactEmail}
          </li>
        </ul>
      </section>

      <hr aria-hidden="true" />

      <section>
        <h2>{tFunc('statement.appealTitle')}</h2>
        <p>{tFunc('statement.appealIntro')}</p>
        <p>{tFunc('statement.appealMethods')}</p>
        <ul>
          <li>
            {tFunc('statement.appealOption1')}{' '}
            <a href="https://formulaire.defenseurdesdroits.fr/">
              {tFunc('statement.appealOption1Link')}
            </a>
          </li>
          <li>{tFunc('statement.appealOption2')}</li>
          <li>
            {tFunc('statement.appealOption3')}
            <br />
            <strong style={{ whiteSpace: 'pre-line' }}>
              {tFunc('statement.appealAddress')}
            </strong>
          </li>
        </ul>
      </section>
    </>
  );
}

export default function AccessibilityStatement({ data }: { data: StatementData }) {
  const { t, i18n } = useTranslation();
  const frenchContentRef = useRef<HTMLDivElement>(null);

  const getStyledHTML = (content: string) => `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Déclaration d accessibilité - ${data.siteName}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; }
    h1 { font-size: 2.5em; font-weight: bold; margin-top: 0; margin-bottom: 1rem; color: #000; }
    h2 { font-size: 1.75em; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: #000; }
    h3 { font-size: 1.25em; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #000; }
    p { margin-bottom: 1rem; line-height: 1.6; }
    strong { font-weight: bold; }
    section { margin-bottom: 2rem; }
    ul { list-style-type: disc; margin-left: 2rem; margin-bottom: 1rem; }
    li { margin-bottom: 0.5rem; line-height: 1.6; }
    a { color: #0066cc; text-decoration: underline; }
    hr { border: none; border-top: 1px solid #ccc; margin: 2rem 0; }
  </style>
</head>
<body>${content}</body>
</html>`;

  const handleDownloadHTML = () => {
    if (!frenchContentRef.current) return;
    const htmlContent = getStyledHTML(frenchContentRef.current.innerHTML);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `declaration-accessibilite-${data.siteName
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (!frenchContentRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;
    const htmlContent = getStyledHTML(frenchContentRef.current.innerHTML);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    await html2pdf()
      .set({
        margin: 15,
        filename: `declaration-accessibilite-${data.siteName
          .replace(/[^a-z0-9]/gi, '-')
          .toLowerCase()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(tempDiv)
      .save();
    document.body.removeChild(tempDiv);
  };

  return (
    <main className="accessibility-statement">
      <div className="download-buttons">
        <button onClick={handleDownloadHTML} className="download-btn">
          {t('statement.downloadHTML')}
        </button>
        <button onClick={handleDownloadPDF} className="download-btn">
          {t('statement.downloadPDF')}
        </button>
      </div>

      <div>
        <StatementContent tFunc={t as TFunc} data={data} />
      </div>

      <div ref={frenchContentRef} style={{ display: 'none' }}>
        <StatementContent tFunc={i18n.getFixedT('fr') as TFunc} data={data} />
      </div>
    </main>
  );
}
