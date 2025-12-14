import React from 'react';
import { FaGamepad, FaMusic, FaHandPaper, FaArrowLeft } from 'react-icons/fa';

const ActivitySelection = ({ onSelectActivity, onBack }) => {
  return (
    <div className="main-content" style={{textAlign:'center'}}>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between'}}>
        <h1 className="page-title">Select Activity</h1>
        <button className="action-btn" onClick={onBack} style={{background:'transparent'}}><FaArrowLeft /> Back to Profile</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'30px', marginTop:'50px'}}>
        
        {/* Activity 1: Color Match */}
        <div 
            onClick={() => onSelectActivity('color-match')}
            style={{
                background:'white', padding:'40px', borderRadius:'20px', cursor:'pointer',
                boxShadow:'0 10px 20px rgba(0,0,0,0.05)', transition:'transform 0.2s', border:'2px solid transparent'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#3498db'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
        >
            <div style={{fontSize:'4rem', color:'#E74C3C', marginBottom:'20px'}}><FaGamepad /></div>
            <h2>Color Match</h2>
            <p style={{color:'#666'}}>Match the LED color by pressing the correct pad.</p>
            <span style={{background:'#E74C3C', color:'white', padding:'5px 10px', borderRadius:'10px', fontSize:'12px'}}>Visual / Tactile</span>
        </div>

        {/* Placeholder Activity 2 */}
        <div style={{background:'#f9f9f9', padding:'40px', borderRadius:'20px', opacity:0.6}}>
            <div style={{fontSize:'4rem', color:'#aaa', marginBottom:'20px'}}><FaMusic /></div>
            <h2>Sound Scape</h2>
            <p style={{color:'#999'}}>Coming Soon (Phase 2)</p>
        </div>

        {/* Placeholder Activity 3 */}
        <div style={{background:'#f9f9f9', padding:'40px', borderRadius:'20px', opacity:0.6}}>
            <div style={{fontSize:'4rem', color:'#aaa', marginBottom:'20px'}}><FaHandPaper /></div>
            <h2>Texture Talk</h2>
            <p style={{color:'#999'}}>Coming Soon (Phase 2)</p>
        </div>

      </div>
    </div>
  );
};

export default ActivitySelection;