import React from "react";

const AboutContent: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">About Blockrights</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="mb-4 text-lg">
          At Blockrights, we are committed to revolutionizing digital rights
          management through innovative blockchain solutions and cutting-edge
          technology. Our mission is to empower creators and businesses with
          robust tools to protect their digital assets against unauthorized use
          and AI misuse.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Expertise</h2>
        <p className="mb-4">
          With extensive experience in blockchain technology and digital rights
          management, our team of experts specializes in:
        </p>
        <ul className="list-disc list-inside mb-4 pl-4">
          <li>Blockchain-powered content registration</li>
          <li>Smart contract implementation for digital rights</li>
          <li>AI usage tracking and verification</li>
        </ul>
        <p>
          We leverage these competencies to deliver tailored solutions that
          ensure proper attribution and compensation for digital creators.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Our Approach</h2>
        <p className="mb-4">
          We believe in a user-centric approach, working closely with creators
          and businesses to understand their unique challenges in the digital
          space. Our process involves:
        </p>
        <ol className="list-decimal list-inside mb-4 pl-4">
          <li>Secure content registration on the blockchain</li>
          <li>Custom license creation and management</li>
          <li>Automated verification and payment systems</li>
          <li>Continuous monitoring and protection against AI misuse</li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Why Choose Blockrights</h2>
        <ul className="list-disc list-inside mb-4 pl-4">
          <li>Cutting-edge blockchain technology for content protection</li>
          <li>Comprehensive AI usage tracking</li>
          <li>User-friendly dashboard for content management</li>
          <li>
            Scalable solutions for individual creators and large enterprises
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <p className="mb-4">
          Ready to secure your digital rights? Get in touch with our team of
          experts:
        </p>
        <ul className="list-none">
          <li className="mb-2">
            <strong>Email:</strong> blocklinklabs@gmail.com
          </li>
          <li className="mb-2">
            <strong>Phone:</strong> +233 24 910 7812
          </li>
        </ul>
      </section>
    </div>
  );
};

export default AboutContent;
