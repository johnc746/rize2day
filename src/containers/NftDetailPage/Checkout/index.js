import React from "react";
import cn from "classnames";
import styles from "./Checkout.module.sass";
import ButtonPrimary from "shared/Button/ButtonPrimary";


const Checkout = ({ className = "" , onOk, onCancel, items = [], nft = {} }) => {
  
  return (
    <div className={cn(className, styles.checkout)}>
      <div className={cn("h4", styles.title)}>Checkout</div>
      <div className={styles.info}>
        You are about to purchase <strong>{nft && nft.name}</strong>
        {/* from{" "}<strong>PINK BANANA</strong> */}
      </div>
      <div className={styles.table}>
        {
        (items && items.length > 0) && 
        items.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.title}</div>
            <div className={styles.col}>{x.value}</div>
          </div>
        ))}
      </div>
      {/* <div className={styles.attention}>
        <div className={styles.preview}>
          <Icon name="info-circle" size="32" />
        </div>
        <div className={styles.details}>
          <div className={styles.subtitle}>This creator is not verified</div>
          <div className={styles.text}>Purchase this item at your own risk</div>
        </div>
      </div>
      <div className={cn("h4", styles.title)}>Follow steps</div>
      <div className={styles.line}>
        <div className={styles.icon}>
          <LoaderCircle className={styles.loader} />
        </div>
        <div className={styles.details}>
          <div className={styles.subtitle}>Purchasing</div>
          <div className={styles.text}>
            Sending transaction with your wallet
          </div>
        </div>
      </div> */}
      {/* <div className={styles.attention}>
        <div className={styles.preview}>
          <Icon name="info-circle" size="32" />
        </div>
        <div className={styles.details}>
          <div className={styles.subtitle}>This creator is not verified</div>
          <div className={styles.text}>Purchase this item at your own risk</div>
        </div>
        <div className={styles.avatar}>
          <img src="/images/content/avatar-3.jpg" alt="Avatar" />
        </div>
      </div> */}
      <div className={styles.btns}>
        <ButtonPrimary className={cn("button", styles.button)} onClick={onOk}>
          I understand, continue
        </ButtonPrimary>
        <ButtonPrimary className={cn("button-stroke", styles.button)} onClick={onCancel} >Cancel</ButtonPrimary>
      </div>
    </div>
  );
};

export default Checkout;
