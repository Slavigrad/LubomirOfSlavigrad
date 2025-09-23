/**
 * Experience Data for Lubomir of Slavigrad
 *
 * Professional experience data following the hierarchical position structure
 * with detailed information about roles, achievements, and technologies.
 */

import { Experience } from '../models/cv-data.interface';
import { INDUSTRIES } from '../shared/constants/industry.constants';


export const experiences: Experience[] = [
  {
    id: 'exp-mimacom',
    company: 'Mimacom',
    location: 'Zurich, Switzerland',
    locationType: 'on-site',
    overallStartDate: new Date('2024-07-01'),
    overallEndDate: null,
    industry: [INDUSTRIES.FINTECH, INDUSTRIES.PUBLIC_INFRASTRUCTURE],
    type: 'full-time',
    company_size: 'medium',
    company_description: 'Leading Swiss technology consultancy specializing in digital transformation and enterprise solutions',
    company_website: 'https://mimacom.com',

    positions: [
      {
        id: 'mimacom-pos-senior',
        title: 'Senior Software Engineer',
        startDate: new Date('2024-07-01'),
        endDate: null, // This should be updated when you get promoted to Software Architect
        description: 'Developing and maintaining backend applications for Swiss federal projects and banking systems, focusing on workflow automation and digital onboarding processes.',
        technologies: ['Java 17', 'Spring Boot 3', 'Flowable', 'Oracle', 'Docker', 'Angular', 'React', 'TypeScript', 'Spring Security'],
        responsibilities: [
          'Maintain backend applications for Swiss federal infrastructure projects',
          'Develop and enhance digital onboarding systems for financial institutions',
          'Upgrade Flowable workflow engine and implement process improvements',
          'Work on special permit applications for Federal Roads Office',
          'Collaborate with cross-functional teams on enterprise solutions'
        ],
        achievements: [
          'Successfully reduced Migros Bank customer onboarding time to under 25 minutes',
          'Enhanced ASTRA\'s special permit application system',
          'Led Flowable upgrade from version 3.14 to 3.15',
          'Delivered solutions for multiple Swiss federal agencies'
        ],
        projects: [
          {
            id: 'project-isak-relaunch',
            name: 'ISAK Relaunch - BAG (Federal Office of Public Health)',
            description: 'New Information System for Health Insurance Supervision - building the foundation for a data collection and analytics platform for all supervisory activities in insurance oversight',
            technologies: ['Java 21', 'Spring Boot 3', 'Angular'],
            duration: 'Jul 2025 - ongoing',
            status: 'in-progress',
            role_in_project: 'Senior Software Engineer',
            team_size: 4,
            results: ['Ongoing project for health information system modernization'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-astra-fedro',
            name: 'ASTRA/FEDRO Enhancement',
            description: 'Flowable upgrade and special permit application enhancement for Federal Roads Office',
            technologies: ['Flowable', 'Java 17', 'Spring Boot 3', 'Spring Security', 'Oracle', 'Docker', 'React', 'TypeScript'],
            duration: 'Jan 2025 - Jul 2025',
            status: 'completed',
            role_in_project: 'Senior Software Engineer',
            team_size: 3,
            results: [
              'Successful Flowable upgrade from 3.14 to 3.15',
              'Enhanced ASTRA Superb special permit application',
              'Improved system performance and user experience'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-migros-onboarding',
            name: 'Migros Bank Digital Onboarding',
            description: 'Backend applications for customer product ordering and video identification onboarding',
            technologies: ['Java 17', 'Spring Boot', 'Flowable', 'Oracle', 'Docker'],
            duration: 'Jul 2024 - Dec 2024',
            status: 'completed',
            role_in_project: 'Senior Software Engineer',
            team_size: 5,
            results: [
              'Reduced onboarding time to under 25 minutes',
              'Automated and standardized internal processes',
              'Enabled seamless video identification workflow',
              'Improved customer experience and operational efficiency'
            ],
            metrics: [
              {
                metric: 'Onboarding Time',
                value: '< 25 minutes',
                improvement: 'Significant reduction from previous process'
              }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        teamSize: 5,
        key_metrics: [
          {
            metric: 'Process Efficiency',
            value: '< 25 min onboarding',
            improvement: 'Automated workflows',
            context: 'Migros Bank digital onboarding'
          },
          {
            metric: 'System Upgrades',
            value: 'Flowable 3.14 → 3.15',
            improvement: 'Zero downtime upgrade',
            context: 'Federal infrastructure systems'
          }
        ],
        skills_developed: ['Flowable Workflow Engine', 'Swiss Federal Systems', 'Banking Domain Knowledge'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],

    team_structure: {
      reporting_to: 'Technical Director',
      team_size: 5,
      direct_reports: 0,
      cross_functional_teams: ['Product', 'DevOps', 'QA', 'Federal Client Teams']
    },

    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    id: 'exp-dnation',
    company: 'dNation - MAKING CLOUD EASY',
    location: 'Bratislava, Slovakia / Vienna, Austria',
    locationType: 'remote',
    overallStartDate: new Date('2022-12-01'),
    overallEndDate: new Date('2024-06-30'),
    industry: [INDUSTRIES.AUTOMOTIVE],
    type: 'full-time',
    company_size: 'small',
    company_description: 'Cloud-native technology company specializing in Kubernetes and modern software solutions',

    positions: [
      {
        id: 'dnation-pos-senior-engineer',
        title: 'Senior Software Engineer',
        role: 'Microservices Architect, Backend Developer',
        startDate: new Date('2022-12-01'),
        endDate: new Date('2024-06-30'),
        description: 'Developed sophisticated automotive backend system for Mercedes-Benz.io license administration using microservices architecture, showcasing expertise in modern cloud-native technologies.',
        technologies: ['Java 17', 'Kotlin 1.8', 'Spring Boot 3', 'Docker', 'Kubernetes', 'AWS', 'Kafka', 'PostgreSQL', 'Gradle', 'Docker-compose', 'Kafka with Avro', 'OAuth 2 SSL Authentication', 'Azure EventHub', 'ArgoCD', 'GitHub Workflows', 'SonarQube', 'Blackduck'],
        responsibilities: [
          'Participate in Agile planning and sprint sessions for software increment delivery',
          'Develop solutions in Kotlin and Spring Boot ensuring code quality and business alignment',
          'Configure Docker and Docker-compose environments for streamlined development and deployment',
          'Conduct comprehensive testing including unit tests and ArchUnit testing',
          'Document system configurations and operational procedures in Confluence',
          'Configure CI/CD pipelines using GitHub Workflows for secure software delivery',
          'Provide client consultation on best practices and viable solutions'
        ],
        achievements: [
          'Architected scalable microservices system for automotive license administration',
          'Implemented hexagonal architecture with domain-driven design principles',
          'Established GitOps deployment practices with ArgoCD',
          'Delivered high-quality solutions using modern testing strategies including ArchUnit'
        ],
        projects: [
          {
            id: 'project-mercedes-benz-license',
            name: 'Mercedes-Benz.io License Administration System',
            description: 'Sophisticated automotive backend system for license administration using microservices architecture',
            technologies: ['Java 17', 'Kotlin 1.8', 'Spring Boot 3', 'Docker', 'Kubernetes', 'AWS', 'Kafka', 'PostgreSQL', 'ArgoCD'],
            duration: 'Dec 2022 - Jun 2024',
            status: 'completed',
            role_in_project: 'Senior Software Engineer',
            team_size: 6,
            results: [
              'Microservices architecture with Hexagonal Architecture pattern',
              'Domain Driven Design implementation',
              'REST APIs with OpenAPI, API-First Approach',
              'GitOps CI/CD with ArgoCD and GitHub Workflows',
              'Comprehensive testing strategy with ArchUnit',
              'OAuth 2 SSL Authentication integration'
            ],
            client: 'PHACTUM Softwareentwicklung GmbH / Mercedes-Benz.io',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        teamSize: 6,
        key_metrics: [
          {
            metric: 'Architecture Implementation',
            value: 'Hexagonal + DDD',
            improvement: 'Modern microservices design',
            context: 'Automotive license administration'
          },
          {
            metric: 'Technology Stack',
            value: 'Java 17 + Kotlin 1.8',
            improvement: 'Cloud-native architecture',
            context: 'Spring Boot 3 + Kubernetes'
          }
        ],
        skills_developed: ['Hexagonal Architecture', 'Domain Driven Design', 'GitOps with ArgoCD', 'ArchUnit Testing'],
        training_completed: [
          {
            name: 'Kubernetes Advanced Concepts',
            provider: 'Cloud Native Computing Foundation',
            completion_date: new Date('2023-03-15'),
            certification: 'CKA Preparation'
          },
          {
            name: 'Domain Driven Design Fundamentals',
            provider: 'Internal Training',
            completion_date: new Date('2023-01-20')
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],

    team_structure: {
      reporting_to: 'Engineering Manager',
      team_size: 6,
      direct_reports: 0,
      cross_functional_teams: ['Product', 'DevOps', 'QA', 'Client PHACTUM Team']
    },

    reason_for_leaving: 'Career advancement opportunity at Swiss technology consultancy (Mimacom)',

    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    id: 'exp-logamic',
    company: 'Logamic',
    location: 'Bratislava, Slovakia / Vienna, Austria',
    locationType: 'remote',
    overallStartDate: new Date('2020-07-01'),
    overallEndDate: new Date('2022-08-31'),
    industry: [INDUSTRIES.TELECOMMUNICATIONS, INDUSTRIES.VOIP],
    type: 'full-time',
    company_size: 'small',
    company_description: 'Software development company working with Communi5, an Austrian manufacturer of communications solutions for service providers',

    positions: [
      {
        id: 'logamic-pos-senior-java',
        title: 'Senior Java Software Engineer',
        role: 'Backend Developer, VoIP Systems Specialist',
        startDate: new Date('2020-07-01'),
        endDate: new Date('2022-08-31'),
        description: 'Developed backend system called FeatureServer for Communi5 VoIP solution, focusing on web teleconferencing and call management with REST interface.',
        technologies: ['Java 8', 'Java 17', 'Gradle', 'Maven', 'Wildfly 26', 'JAX-RS', 'Jersey', 'JAXB', 'Java EE Dependency Injection', 'Java Lambda Expressions', 'Java Mail API OAuth2', 'OpenAPI (Swagger)', 'Cassandra NoSQL', 'MariaDB', 'SIP', 'SDP', 'RTP', 'WebRTC', 'REST', 'XML', 'JSON', 'Dialogic PowerMedia XMS', 'Hazelcast'],
        responsibilities: [
          'Develop FeatureServer backend system for VoIP solution',
          'Create and manage meeting rooms and call handling functionality',
          'Implement REST APIs for call management with OpenAPI and SwaggerUI',
          'Develop WebServices for communicating with XMS Media Server',
          'Upgrade system from Java 8 to Java 17',
          'Implement call operations: Hold, Mute, Pin, Transfer',
          'Handle real-time communication protocols (SIP, SDP, RTP, WebRTC)'
        ],
        achievements: [
          'Successfully migrated production system from Java 8 to Java 17 with zero downtime',
          'Delivered comprehensive VoIP call management system',
          'Implemented real-time call handling for enterprise teleconferencing',
          'Established REST API standards with OpenAPI documentation'
        ],
        projects: [
          {
            id: 'project-communi5-featureserver',
            name: 'Communi5 FeatureServer',
            description: 'Backend system for VoIP web teleconferencing with comprehensive call management capabilities',
            technologies: ['Java 17', 'JAX-RS', 'Jersey', 'Cassandra', 'MariaDB', 'SIP', 'WebRTC', 'Dialogic PowerMedia XMS'],
            duration: 'Jul 2020 - Aug 2022',
            status: 'completed',
            role_in_project: 'Senior Backend Developer',
            team_size: 4,
            results: [
              'Create Meetings (Rooms) functionality',
              'Call Handling - Add/Remove Call to/from Meeting',
              'Transfer Call with Ad-hoc Meeting creation',
              'Call Operations: Hold, Mute, Pin',
              'REST Interface with OpenAPI and SwaggerUI',
              'XMS Media Server integration'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-java17-migration',
            name: 'Java 8 to Java 17 Migration',
            description: 'Major system upgrade from Java 8 to Java 17 with performance and security improvements',
            technologies: ['Java 17', 'Wildfly 26', 'Gradle', 'Maven'],
            duration: 'Jan 2022 - May 2022',
            status: 'completed',
            role_in_project: 'Migration Lead',
            team_size: 3,
            results: [
              'Zero downtime migration to Java 17',
              'Improved system performance and security',
              'Modern Java features adoption',
              'Updated build and deployment processes'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        teamSize: 4,
        key_metrics: [
          {
            metric: 'System Migration',
            value: 'Java 8 → 17',
            improvement: 'Zero downtime upgrade',
            context: 'Production VoIP system'
          },
          {
            metric: 'VoIP Features',
            value: 'Complete call management',
            improvement: 'Real-time communication',
            context: 'Enterprise teleconferencing'
          }
        ],
        skills_developed: ['VoIP Protocols', 'Real-time Communications', 'Java Migration Strategies'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],

    team_structure: {
      reporting_to: 'Technical Lead',
      team_size: 4,
      direct_reports: 0,
      cross_functional_teams: ['Product', 'QA', 'Austrian Client Team']
    },

    reason_for_leaving: 'Career advancement opportunity in automotive microservices architecture',

    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    id: 'exp-cn-group',
    company: 'CN Group CZ s.r.o.',
    location: 'Bratislava, Slovakia',
    locationType: 'on-site',
    overallStartDate: new Date('2016-10-01'),
    overallEndDate: new Date('2019-12-31'),
    industry: [INDUSTRIES.INFOTAINMENT, INDUSTRIES.AUTOMOTIVE],
    type: 'full-time',
    company_size: 'medium',
    company_description: 'Software development company specializing in infotainment systems and enterprise solutions',

    positions: [
      {
        id: 'cn-group-pos-senior-cpp',
        title: 'Senior C++ Developer',
        role: 'Infotainment Systems Developer, Linux Specialist',
        startDate: new Date('2016-10-01'),
        endDate: new Date('2019-12-31'),
        description: 'Developed infotainment systems for international train companies and maintained enterprise automotive systems for Porsche Informatik within Volkswagen Group.',
        technologies: ['C++ 11', 'Boost', 'ZeroMQ', 'CEF Browser', 'VLC', 'Live555', 'RTSP', 'SNMP', 'Visual C++', 'MFC', 'Python 3', 'Qt Developer', 'Visual Studio', 'Ubuntu Linux 16.04', 'Debian Linux 8', 'Windows 10'],
        responsibilities: [
          'Develop multicast streaming systems for train infotainment',
          'Implement media streaming server and client applications',
          'Maintain legacy C++ modules for automotive spare-parts ordering systems',
          'Collaborate with cross-functional teams on enterprise system rollouts',
          'Perform bug fixes, refactoring, and test hardening in safety-conscious environments',
          'Develop specialized hardware drivers for input devices'
        ],
        achievements: [
          'Successfully delivered real-time media streaming solution for international train companies',
          'Improved reliability and performance of Volkswagen Group spare-parts systems',
          'Contributed to incident remediation across multiple markets',
          'Developed innovative SpaceMouse driver for Linux platforms'
        ],
        projects: [
          {
            id: 'project-nomad-digital',
            name: 'Nomad Digital Infotainment System',
            description: 'Multicast streaming system for media distribution in international train companies',
            technologies: ['C++ 11', 'Boost', 'ZeroMQ', 'CEF Browser', 'VLC plugin', 'Live555', 'RTSP', 'SNMP'],
            duration: 'Oct 2016 - Apr 2018',
            status: 'completed',
            role_in_project: 'Senior Developer',
            team_size: 4,
            results: [
              'Real-time multicast streaming of video, audio, and images',
              'Seamless client-server communication with ZeroMQ',
              'RTSP protocol implementation for media streaming',
              'Cross-platform compatibility on Linux systems'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-porsche-informatik',
            name: 'Porsche Informatik Spare Parts System',
            description: 'Legacy C++ system maintenance for Volkswagen Group spare-parts ordering and aftersales workflows',
            technologies: ['Visual C++', 'MFC', 'Windows 10', 'Visual Studio'],
            duration: 'Apr 2018 - Dec 2019',
            status: 'completed',
            role_in_project: 'Software Engineer',
            team_size: 6,
            results: [
              'Enhanced reliability of spare-parts ordering systems',
              'Improved performance of existing code paths',
              'Successful rollouts across multiple markets',
              'Maintained integrations with downstream retail systems'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-kuenz-spacemouse',
            name: 'Kuenz SpaceMouse Driver',
            description: 'Linux driver development for 3D SpaceMouse input device',
            technologies: ['Python 3', 'Linux'],
            duration: 'Nov 2019 - Dec 2019',
            status: 'completed',
            role_in_project: 'Driver Developer',
            team_size: 1,
            results: [
              'Functional SpaceMouse driver for Linux platforms',
              'Cross-platform input device compatibility'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        teamSize: 6,
        key_metrics: [
          {
            metric: 'Systems Maintained',
            value: '3 major projects',
            improvement: 'Infotainment + Automotive',
            context: 'Cross-industry experience'
          },
          {
            metric: 'Technology Diversity',
            value: 'C++, Python, Linux, Windows',
            improvement: 'Multi-platform expertise',
            context: 'Versatile development skills'
          }
        ],
        skills_developed: ['Real-time Media Streaming', 'Enterprise System Maintenance', 'Cross-platform Development'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],

    team_structure: {
      reporting_to: 'Technical Lead',
      team_size: 6,
      direct_reports: 0,
      cross_functional_teams: ['QA', 'DevOps', 'Product Management']
    },

    reason_for_leaving: 'Transition back to Java/backend development and VoIP technologies',

    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    id: 'exp-3ckysoft',
    company: '3ckysoft',
    location: 'Bratislava, Slovakia',
    locationType: 'on-site',
    overallStartDate: new Date('2016-01-01'),
    overallEndDate: new Date('2016-07-31'),
    industry: [INDUSTRIES.THREE_D_GRAPHICS],
    type: 'full-time',
    company_size: 'startup',
    company_description: '3D graphics and computer vision technology company specializing in point cloud processing solutions',

    positions: [
      {
        id: '3ckysoft-pos-lead-cpp',
        title: 'Lead C++ Developer',
        role: '3D Graphics Specialist, Linux Developer',
        startDate: new Date('2016-01-01'),
        endDate: new Date('2016-07-31'),
        description: 'Led development of 3D Point Cloud Editor for scanned object processing, implementing point cloud registration algorithms to create consistent models from multiple scanning angles.',
        technologies: ['C++ 11', 'Point Cloud Library (PCL)', 'VTK Library', 'OpenGL', 'Nvidia GRID SDK', 'Boost', 'STL', 'libwebsockets', 'H.264 encoding/decoding', 'Git', 'Ubuntu Linux 14.04', 'CLion', 'Sublime'],
        responsibilities: [
          'Lead project team of 3 developers as Lead programmer',
          'Design and implement Point Cloud Editor using SOLID and TDD principles',
          'Develop point cloud registration algorithms for 3D model reconstruction',
          'Implement 3D graphics rendering with OpenGL and shader technology',
          'Create WebSocket-based application streaming with Nvidia GRID',
          'Optimize point cloud processing performance and memory usage'
        ],
        achievements: [
          'Successfully delivered Point Cloud Editor from concept to production',
          'Implemented complex 3D algorithms for point cloud registration',
          'Led team using SOLID principles and TDD methodology',
          'Achieved real-time 3D rendering performance with large datasets',
          'Established innovative streaming solution with WebSocket technology'
        ],
        projects: [
          {
            id: 'project-pointcloud-editor',
            name: '3D Point Cloud Editor',
            description: 'Advanced point cloud processing application for creating consistent 3D models from multiple scanned datasets',
            technologies: ['C++ 11', 'Point Cloud Library', 'VTK Library', 'OpenGL', 'Nvidia GRID SDK', 'Boost', 'STL'],
            duration: 'Jan 2016 - Jul 2016',
            status: 'completed',
            role_in_project: 'Lead Developer',
            team_size: 3,
            results: [
              'Loading and downsampling of large scanned object datasets',
              'Point cloud registration combining multiple datasets into global consistent model',
              'Advanced measurement tools: angle measurement, point distance calculation',
              'Various point removal techniques for data cleanup',
              'Real-time 3D visualization with OpenGL'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-streaming-solution',
            name: 'WebSocket Application Streaming',
            description: 'Innovative streaming solution for remote 3D application access using WebSocket technology',
            technologies: ['libwebsockets', 'Nvidia GRID SDK', 'H.264 encoding/decoding', 'WebSocket'],
            duration: 'Mar 2016 - Jul 2016',
            status: 'completed',
            role_in_project: 'Lead Developer',
            team_size: 2,
            results: [
              'Real-time application streaming over WebSocket',
              'H.264 video encoding/decoding implementation',
              'Remote key and mouse event simulation',
              'Low-latency 3D graphics streaming'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        teamSize: 3,
        key_metrics: [
          {
            metric: 'Point Cloud Processing',
            value: 'Real-time rendering',
            improvement: 'Large dataset optimization',
            context: '3D graphics performance'
          },
          {
            metric: 'Team Leadership',
            value: '3 developers',
            improvement: 'SOLID & TDD implementation',
            context: 'Agile development practices'
          }
        ],
        skills_developed: ['3D Graphics Programming', 'Point Cloud Algorithms', 'WebSocket Streaming', 'Team Leadership'],
        mentoring: {
          mentees_count: 2,
          mentoring_areas: ['C++11', '3D Graphics', 'OpenGL', 'Software Architecture'],
          success_stories: ['Team successfully delivered complex 3D application using modern C++ practices']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],

    team_structure: {
      reporting_to: 'CTO',
      team_size: 3,
      direct_reports: 2,
      cross_functional_teams: ['Product Design', 'Research']
    },

    reason_for_leaving: 'Opportunity to work on larger scale projects in infotainment industry',

    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    id: 'exp-cgi',
    company: 'CGI',
    location: 'Bratislava, Slovakia',
    locationType: 'on-site',
    overallStartDate: new Date('2013-07-01'),
    overallEndDate: new Date('2015-12-31'),
    industry: [INDUSTRIES.TELECOMMUNICATIONS, INDUSTRIES.FINTECH, INDUSTRIES.ENTERPRISE_APPLICATION_INTEGRATION],
    type: 'full-time',
    company_size: 'large',
    company_description: 'Global information technology consulting, systems integration and outsourcing company',

    positions: [
      {
        id: 'cgi-pos-analyst-programmer',
        title: 'Analyst Programmer',
        role: 'EAI Specialist (Tibco middleware) / Java Developer / Telco & Finance',
        startDate: new Date('2013-07-01'),
        endDate: new Date('2015-12-31'),
        description: 'EAI specialist and Java developer working on telecommunications and financial sector projects, specializing in Tibco BusinessWorks and Spring framework solutions.',
        technologies: ['Tibco BW Designer 5.7', 'Tibco Administrator 5.7', 'Tibco EMS 6.1', 'Tibco RV', 'Java SE 6', 'Java EE 6', 'Spring Framework 4', 'Hibernate', 'Drools rule engine 5', 'Oracle DB', 'MS SQL Server', 'SOAP', 'soapUI 4.5.2', 'HTML', 'JavaScript', 'Git', 'Gerrit', 'Jira', 'Eclipse', 'Hudson'],
        responsibilities: [
          'Tibco BusinessWorks development for telecom systems',
          'Java backend development in Spring and Hibernate',
          'System integration and regression testing',
          'Frontend development in HTML and JavaScript',
          'Creation of business rules with Drools rule engine',
          'Creation and execution of JUnit tests',
          'Deployment and support of production systems',
          'Incident resolution and troubleshooting'
        ],
        achievements: [
          'Successfully delivered EAI solutions for major Slovak telecom operator',
          'Implemented SEPA payment system for financial institution',
          'Established automated testing practices using JUnit',
          'Led successful system deployments and cutovers'
        ],
        projects: [
          {
            id: 'project-slovak-telekom-cgi',
            name: 'Slovak Telekom EAI System',
            description: 'Tibco BusinessWorks EAI system development for Slovak national telecommunications operator',
            technologies: ['Tibco BW Designer 5.7', 'Tibco Administrator 5.7', 'Tibco EMS 6.1', 'Tibco RV', 'SOAP', 'soapUI 4.5.2', 'Java 6', 'Oracle DB', 'SQL'],
            duration: 'Jul 2013 - Jan 2015',
            status: 'completed',
            role_in_project: 'EAI Developer',
            team_size: 5,
            results: [
              'Successful Tibco system deployment',
              'Improved system integration capabilities',
              'Established automated testing framework with Hudson'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-first-data',
            name: 'First Data SEPA Project',
            description: 'Java backend development for SEPA payment system implementation at financial institution',
            technologies: ['Java SE 6', 'Java EE 6', 'Spring Framework 4', 'Hibernate', 'Drools rule engine 5', 'MS SQL Server', 'Oracle 11', 'HTML', 'JavaScript', 'Git', 'Gerrit'],
            duration: 'Jan 2015 - Sep 2015',
            status: 'completed',
            role_in_project: 'Java Developer',
            team_size: 6,
            results: [
              'Successful SEPA payment system implementation',
              'Business rules engine integration with Drools',
              'Comprehensive JUnit test coverage',
              'Reduced payment processing time'
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        teamSize: 6,
        key_metrics: [
          {
            metric: 'Projects Delivered',
            value: '2 major systems',
            improvement: 'Telecom and Finance sectors',
            context: 'EAI and payment systems'
          },
          {
            metric: 'Technology Expertise',
            value: 'Tibco + Java',
            improvement: 'Cross-domain specialization',
            context: 'Enterprise integration and backend development'
          }
        ],
        skills_developed: ['Drools Rule Engine', 'SEPA Payment Systems', 'Automated Testing'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],

    team_structure: {
      reporting_to: 'Senior Developer',
      team_size: 6,
      direct_reports: 0,
      cross_functional_teams: ['QA', 'Business Analysis', 'DevOps']
    },

    reason_for_leaving: 'Career advancement opportunity in C++ and 3D graphics development',

    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    id: 'exp-wezeo',
    company: 'WEZEO',
    location: 'Bratislava, Slovakia',
    locationType: 'on-site',
    overallStartDate: new Date('2011-09-01'),
    overallEndDate: new Date('2013-06-30'),
    industry: [INDUSTRIES.MOBILE_APPLICATION_DEVELOPMENT],
    type: 'contract',
    company_size: 'small',
    company_description: 'Mobile application development company specializing in iOS applications for Slovak market',

    positions: [
      {
        id: 'wezeo-pos-lead-ios',
        title: 'Lead iOS Developer',
        startDate: new Date('2011-09-01'),
        endDate: new Date('2013-06-30'),
        description: 'Led iOS mobile application development team, handling full development lifecycle from analysis and design to deployment for customer projects.',
        technologies: ['Objective-C', 'Xcode', 'JSON', 'REST services', 'MVC (Model-View-Controller)', 'iOS 4', 'iOS 5', 'iOS 6', 'SQL'],
        responsibilities: [
          'Analyze, design, code, test and deploy iOS mobile applications for customers',
          'Lead development team of 4 developers',
          'Design custom tailored iOS applications based on client requirements',
          'Ensure code quality and adherence to iOS development best practices',
          'Coordinate project timelines and deliverables',
          'Communicate with clients and gather requirements'
        ],
        achievements: [
          'Successfully delivered multiple iOS applications for Slovak market',
          'Led team of 4 developers to consistent project delivery',
          'Established iOS development processes and standards',
          'Built strong client relationships resulting in repeat business'
        ],
        projects: [
          {
            id: 'project-idonaska',
            name: 'idonaska.sk',
            description: 'iOS application for Slovak delivery service platform',
            technologies: ['Objective-C', 'REST services', 'JSON'],
            duration: 'Sep 2011 - Dec 2012',
            status: 'completed',
            role_in_project: 'Lead Developer',
            team_size: 3,
            results: ['Successful app store deployment', 'Positive user feedback'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-pivovary',
            name: 'Pivovary',
            description: 'iOS application for brewery information and beer discovery',
            technologies: ['Objective-C', 'MVC', 'JSON'],
            duration: 'Jan 2012 - Aug 2012',
            status: 'completed',
            role_in_project: 'Lead Developer',
            team_size: 2,
            results: ['Featured in Slovak App Store', 'High user engagement'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-tapaty',
            name: 'Tapaty',
            description: 'iOS social application for Slovak market',
            technologies: ['Objective-C', 'REST services', 'MVC'],
            duration: 'Sep 2012 - Jun 2013',
            status: 'completed',
            role_in_project: 'Lead Developer',
            team_size: 4,
            results: ['Successful market launch', 'Growing user base'],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        teamSize: 4,
        key_metrics: [
          {
            metric: 'Applications Delivered',
            value: '3+ iOS apps',
            improvement: '100% successful deployment',
            context: 'Slovak mobile market'
          },
          {
            metric: 'Team Leadership',
            value: '4 developers',
            improvement: 'Consistent project delivery',
            context: 'iOS development team'
          }
        ],
        skills_developed: ['iOS Development Leadership', 'Mobile UX Design', 'Client Communication'],
        mentoring: {
          mentees_count: 3,
          mentoring_areas: ['Objective-C', 'iOS Development', 'Mobile App Architecture'],
          success_stories: ['Team successfully delivered all client projects on time']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],

    team_structure: {
      reporting_to: 'Project Manager',
      team_size: 4,
      direct_reports: 3,
      cross_functional_teams: ['Design', 'QA']
    },

    reason_for_leaving: 'Transition back to enterprise backend development',

    createdAt: new Date(),
    updatedAt: new Date()
  },

  {
    id: 'exp-accenture',
    company: 'Accenture',
    location: 'Bratislava, Slovakia',
    locationType: 'on-site',
    overallStartDate: new Date('2006-03-01'),
    overallEndDate: new Date('2011-08-31'),
    industry: [INDUSTRIES.TELECOMMUNICATIONS, INDUSTRIES.ENTERPRISE_APPLICATION_INTEGRATION],
    type: 'full-time',
    company_size: 'enterprise',
    company_description: 'Global professional services company with leading capabilities in digital, cloud and security',

    positions: [
      {
        id: 'accenture-pos-software-engineer',
        title: 'Software Engineer',
        startDate: new Date('2006-03-01'),
        endDate: new Date('2008-09-30'),
        description: 'EAI specialist developing Java and Vitria solutions for European telecommunications companies. Focused on system integration and enterprise application development.',
        technologies: ['Java', 'Vitria 4.2', 'Oracle DB', 'SQL', 'XSLT', 'UML', 'Apache ANT'],
        responsibilities: [
          'EAI Java and Vitria development for telecom operators',
          'Configure, build and test application components',
          'Analyze, design, code and test multiple components across clients',
          'Perform maintenance, enhancements and development work',
          'System, integration and regression testing'
        ],
        achievements: [
          'Successfully delivered EAI solutions for Slovak Telekom',
          'Established expertise in Vitria middleware platform',
          'Contributed to major telecom infrastructure projects',
          'Built foundation for enterprise application integration'
        ],
        projects: [
          {
            id: 'project-slovak-telekom',
            name: 'Slovak Telekom EAI System',
            description: 'Enterprise application integration system for Slovak national telecommunications operator',
            technologies: ['Java', 'Vitria'],
            duration: 'Mar 2006 - Jul 2009',
            status: 'completed',
            role_in_project: 'EAI Developer',
            team_size: 4,
            results: ['Integrated legacy systems with modern applications', 'Improved system interoperability'],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        teamSize: 4,
        skills_developed: ['Enterprise Application Integration', 'Vitria Middleware', 'Telecom Domain Knowledge'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'accenture-pos-senior-software-engineer',
        title: 'Senior Software Engineer',
        startDate: new Date('2008-09-01'),
        endDate: new Date('2011-08-31'),
        description: 'Senior EAI specialist and Tibco expert working on complex telecommunications projects across Europe. Led technical implementations and provided expertise in middleware solutions.',
        technologies: ['Tibco BusinessWorks', 'Tibco BW Designer 5.6', 'Tibco iProcess', 'Tibco BusinessEvents', 'Tibco Enterprise for JMS', 'Tibco Rendezvous', 'Java', 'Oracle DB', 'SQL'],
        responsibilities: [
          'Lead EAI development using Tibco BusinessWorks and iProcess',
          'Create technical specifications for EAI solutions',
          'Prepare and execute test cases for EAI implementations',
          'Support and maintenance of production systems',
          'Creating functional and technical design documentation',
          'Investigate and resolve complex technical issues'
        ],
        achievements: [
          'Led successful Tibco implementations across 5 European telecom operators',
          'Delivered complex EAI solutions for international projects',
          'Mentored junior developers in Tibco technologies',
          'Established best practices for EAI development lifecycle'
        ],
        projects: [
          {
            id: 'project-slovak-telekom-continued',
            name: 'Slovak Telekom EAI System (Senior Role)',
            description: 'Continued leadership of Slovak Telekom EAI system with enhanced responsibilities',
            technologies: ['Java', 'Vitria', 'Tibco BW'],
            duration: 'Sep 2008 - Jul 2009',
            status: 'completed',
            role_in_project: 'Senior EAI Developer',
            team_size: 6,
            results: ['Led system modernization', 'Improved system performance by 30%'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-btc-bulgaria',
            name: 'Bulgarian Telecommunications Company',
            description: 'Tibco BusinessWorks implementation for Bulgarian national telecom operator - Site: Bratislava, Sofia',
            technologies: ['Tibco BW'],
            duration: 'Jul 2009 - Nov 2009',
            status: 'completed',
            role_in_project: 'Senior EAI Developer',
            team_size: 3,
            results: ['Successfully delivered Tibco BW solution', 'Improved system integration capabilities'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-vodafone-uk',
            name: 'Vodafone UK',
            description: 'Tibco BusinessWorks development for UK Vodafone operations - Site: Newbury, London',
            technologies: ['Tibco BW'],
            duration: 'Nov 2009 - Jun 2010',
            status: 'completed',
            role_in_project: 'Senior EAI Developer',
            team_size: 40,
            results: ['Delivered critical middleware solutions', 'Enhanced system reliability'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-vodafone-cz',
            name: 'Vodafone CZ',
            description: 'Tibco BusinessWorks implementation for Czech Vodafone operations - Site: Bratislava, Prague',
            technologies: ['Tibco BW'],
            duration: 'Jun 2010 - Oct 2010',
            status: 'completed',
            role_in_project: 'Senior EAI Developer',
            team_size: 15,
            results: ['Streamlined telecom operations', 'Reduced integration complexity'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'project-polkomtel',
            name: 'Polkomtel S.A.',
            description: 'Tibco BusinessWorks development for Polish telecommunications operator - Site: Warsaw, Rome',
            technologies: ['Tibco BW'],
            duration: 'Oct 2010 - Apr 2011',
            status: 'completed',
            role_in_project: 'Senior EAI Developer',
            team_size: 12,
            results: ['Successfully implemented across Poland and Italy sites', 'Delivered scalable middleware solution'],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        teamSize: 6,
        key_metrics: [
          {
            metric: 'Projects Delivered',
            value: '5 European telecoms',
            improvement: '100% success rate',
            context: 'Cross-border EAI implementations'
          },
          {
            metric: 'Technology Expertise',
            value: 'Tibco specialist',
            improvement: 'Advanced middleware skills',
            context: 'Enterprise application integration'
          }
        ],
        skills_developed: ['Tibco BusinessWorks', 'Project Leadership', 'International Project Management'],
        mentoring: {
          mentees_count: 3,
          mentoring_areas: ['Tibco Technologies', 'EAI Best Practices', 'Telecom Domain'],
          success_stories: ['Established Tibco development standards for European projects']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],

    team_structure: {
      reporting_to: 'Project Manager',
      team_size: 6,
      direct_reports: 1,
      cross_functional_teams: ['Business Analysis', 'QA', 'Infrastructure']
    },

    reason_for_leaving: 'Seeking new challenges in mobile application development',

    createdAt: new Date(),
    updatedAt: new Date()
  }
];
