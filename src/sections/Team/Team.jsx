import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/LanguageContext';
import { TEAM_MEMBERS } from '../../data/team';
import SectionTitle from '../../components/SectionTitle/SectionTitle';
import './Team.scss';

const Team = () => {
  const { language } = useTranslation();

  return (
    <section className="team-specialists-section pt-100 pb-70">
      <div className="container">
        <SectionTitle
          subTitle={language === 'ar' ? 'فريقنا الطبي' : 'Specialized Team'}
          title={language === 'ar' ? 'كفاءات طبية تخصصية ترعى ابتسامتك' : 'Certified Specialists Caring for Your Smile'}
          description={
            language === 'ar'
              ? 'يضم فريق عيادة حياة نخبة من الاستشاريين والأخصائيين في شتى مجالات طب وجراحة وتجميل الأسنان.'
              : 'Our clinical team unites experienced dental practitioners dedicated to excellence across all disciplines.'
          }
          align="center"
        />

        <div className="row g-4 justify-content-center">
          {TEAM_MEMBERS.map((member, idx) => (
            <div key={member.id} className="col-lg-3 col-md-6">
              <motion.div
                className="team-card-styled"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <div className="team-img-wrapper">
                  <img
                    src={member.image}
                    alt={language === 'ar' ? member.roleAr : member.roleEn}
                    className="doctor-avatar"
                  />
                  <span className="dept-tag">
                    {language === 'ar' ? member.departmentAr : member.departmentEn}
                  </span>
                </div>

                <div className="team-info-box p-3 text-center">
                  <h4 className="doctor-role-title">
                    {language === 'ar' ? member.roleAr : member.roleEn}
                  </h4>
                  <p className="doctor-bio-snippet">
                    {language === 'ar' ? member.bioAr : member.bioEn}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
