'use strict'

import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';

import {
  View,
  TouchableHighlight,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Image,
} from 'react-native';

const ARROW_ICON = require('./img/icon-arrow-settings.png');

class SettingsList extends React.Component {
  static propTypes = {
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    defaultItemSize: PropTypes.number,
    underlayColor: PropTypes.string,
    defaultTitleStyle: PropTypes.object,
    defaultTitleInfoPosition: PropTypes.string,
    scrollViewProps: PropTypes.object,
    indexStart: PropTypes.number,
  };

  static defaultProps ={
    backgroundColor: 'white',
    borderColor: 'black',
    defaultItemSize: 50,
    underlayColor: 'transparent',
    defaultTitleStyle: {fontSize: 16},
    indexStart: 0,
  };

  _getGroups(){
    var groupNumber = -1;
    let headers = [];
    let itemGroup = [];
    let result = [];
    React.Children.forEach(this.props.children, (child) => {
      // Allow for null, optional fields
      if(!child) return;

      if(child.type.displayName === 'Header'){
        if(groupNumber != -1){
          result[groupNumber] = {items: itemGroup, header: headers[groupNumber] };
          itemGroup = [];
        }
        groupNumber++;
        headers[groupNumber] = child.props;
      } else if(child.type.displayName === 'Item'){
        if(groupNumber == -1){
          groupNumber++;
        }
        itemGroup.push(child.props);
      } else {
        if(groupNumber == -1){
          groupNumber++;
        }
        itemGroup.push(child);
      }
    });
    result[groupNumber] = {items: itemGroup, header: headers[groupNumber] };
    return result;
  }

  render(){
    return (
      <ScrollView {...this.props.scrollViewProps} ref="_scrollView">
        {this._getGroups().map((group, index) => {
          return this._groupView(group, this.props.indexStart + index);
        })}
      </ScrollView>
    )
  }

  _groupView(group, grindex){
    if(group.header){
      return (
        <View key={'group_' + grindex}>
          <Text style={[{margin:5},group.header.headerStyle]} numberOfLines={group.header.headerNumberOfLines} ellipsizeMode="tail" ref={group.header.headerRef}>{group.header.headerText}</Text>
          <View style={{borderTopWidth:1, borderBottomWidth:1, borderColor: this.props.borderColor}}>
            {group.items.map((item, index) => {
              return this._itemView(item, grindex, index, group.items.length);
            })}
          </View>
        </View>
      )
    } else {
      let items;
      if (group.items.length > 0) {
        items = (
          <View style={{borderTopWidth:1, borderBottomWidth:1, borderColor: this.props.borderColor}}>
            {group.items.map((item, index) => {
              return this._itemView(item, grindex, index, group.items.length);
            })}
          </View>
        );
      }

      return (
        <View key={'group_' + grindex}>
          {items}
        </View>
      )
    }
  }

  _itemEditableBlock(item, keystr, position) {

    return ([
        <Text
            key={'itemTitle_' + keystr}
            style={[
              item.titleStyle ? item.titleStyle : this.props.defaultTitleStyle,
              position === 'Bottom' ? null : styles.titleText
            ]}>
            {item.title}
        </Text>,
        item.isEditable ?
        <TextInput
              key={item.id}
              style={item.editableTextStyle ? item.editableTextStyle : styles.editableText}
              placeholder = {item.placeholder}
              onChangeText={(text) => item.onTextChange(text)}
              value={item.value} />
        : null
    ])
  }

  _itemTitleBlock(item, keystr, position) {
    return ([
      <Text
          key={'itemTitle_' + keystr}
          style={[
            item.titleStyle ? item.titleStyle : this.props.defaultTitleStyle,
            position === 'Bottom' ? null : styles.titleText
          ]}>
          {item.title}
      </Text>,
      item.titleInfo ?
        <Text
            key={'itemTitleInfo_' + keystr}
            style={[
              item.rightSideStyle ? item.rightSideStyle
              :
                position === 'Bottom' ? null : styles.rightSide,
                {color: '#B1B1B1'},
              item.titleInfoStyle
            ]}>
            {item.titleInfo}
        </Text>
        : null
    ])
  }

  _itemView(item, grindex, index, max){
    var border;

    if (item.type && item.type.displayName) {
        return item;
    }
    item = {
      ...item,
      ...item.props,
    }

    if(item.borderHide) {
      switch(item.borderHide) {
        case 'Top' : border = {borderBottomWidth:1, borderColor: this.props.borderColor}; break;
        case 'Bottom' : border = {borderTopWidth:1, borderColor: this.props.borderColor}; break;
      }
    } else {
      border = index === max-1 ? {borderWidth:0} : {borderBottomWidth:1, borderColor: this.props.borderColor};
    }

    let titleInfoPosition = item.titleInfoPosition ? item.titleInfoPosition : this.props.defaultTitleInfoPosition;

    const keystr = 'item_' + grindex + '_' + index;

    return (
      <TouchableHighlight accessible={false} key={keystr} underlayColor={item.underlayColor ? item.underlayColor : this.props.underlayColor} onPress={item.onPress} onLongPress={item.onLongPress} ref={item.itemRef}>
        <View style={item.itemBoxStyle ? item.itemBoxStyle : [styles.itemBox, {backgroundColor: item.backgroundColor ? item.backgroundColor : this.props.backgroundColor}]}>
          {item.icon}
          {item.isAuth ?
            <View style={item.titleBoxStyle ? item.titleBoxStyle : [styles.titleBox, border]}>
              <View style={{paddingLeft:5,flexDirection:'column',flex:1}}>
                <View style={{borderBottomWidth:1,borderColor:this.props.borderColor}}>
                  <TextInput
                    ref="UserNameInputBlock"
                    onSubmitEditing={() => this.refs.PasswordInputBlock.focus()}
                    style={{flex:1,height:30, borderBottomWidth:1}}
                    placeholder = "username"
                    {...item.authPropsUser}
                  />
                </View>
                <View>
                  <TextInput
                    ref="PasswordInputBlock"
                    style={{flex:1,height:30}}
                    placeholder = "password"
                    secureTextEntry={true}
                    returnKeyType={'go'}
                    {...item.authPropsPW}
                    onSubmitEditing={() => item.onPress()}
                  />
                </View>
              </View>
            </View>
          :
          <View style={item.titleBoxStyle ? item.titleBoxStyle : [styles.titleBox, border, {minHeight:item.itemWidth ? item.itemWidth : this.props.defaultItemSize}]}>
            {titleInfoPosition === 'Bottom' ?
                <View style={{flexDirection:'column',flex:1,justifyContent:'center'}}>
                    {item.isEditable ? this._itemEditableBlock(item, keystr, 'Bottom') : this._itemTitleBlock(item, keystr, 'Bottom')}
                </View>
              : item.isEditable ? this._itemEditableBlock(item, keystr) : this._itemTitleBlock(item, keystr)}

            {item.rightSideContent ? item.rightSideContent : null}
            {item.hasSwitch ?
              <Switch
                {...item.switchProps}
                style={styles.rightSide}
                onValueChange={(value) => item.switchOnValueChange(value)}
                value={item.switchState}/>
                : null}
            {this.itemArrowIcon(item)}
          </View>
        }
        </View>
      </TouchableHighlight>
    )
  }

  itemArrowIcon(item) {
    if(item.arrowIcon) {
        return item.arrowIcon;
    }

    if(item.hasNavArrow){
        return <Image style={[styles.rightSide, item.arrowStyle]} source={ARROW_ICON} />;
    }

    return null;
  }
}

export default SettingsList;

const styles = StyleSheet.create({
  itemBox: {
    flex:1,
    justifyContent:'center',
    flexDirection:'row'
  },
  titleBox: {
    flex:1,
    marginLeft:15,
    flexDirection:'row'
  },
  titleText: {
    flex:1,
    alignSelf:'center'
  },
  rightSide: {
    marginRight:15,
    alignSelf:'center'
  },
  editableText: {
    flex: 1,
    textAlign: 'right',
    marginRight: 15
  }
});

/**
 * Optional Header for groups
 */
SettingsList.Header = createReactClass({
  propTypes: {
    headerText: PropTypes.string,
    headerStyle: PropTypes.object,
    headerRef: PropTypes.func,
    headerNumberOfLines: PropTypes.number,
  },
  getDefaultProps() {
    return {
      headerNumberOfLines: 1,
    };
  },
  /**
   * not directly rendered
   */
  render(){
    return null;
  }
});

/**
 * Individual Items in the Settings List
 */
SettingsList.Item = createReactClass({
  propTypes: {
    /**
     * Title being displayed
     */
    title: PropTypes.string,
    titleStyle: PropTypes.object,
    /**
     * Icon displayed on the left of the settings item
     */
    icon: PropTypes.node,

    /**
     * Item Box Style
     */
    itemBoxStyle : PropTypes.object,
    /**
     * Title Box Style
     */
    titleBoxStyle: PropTypes.object,
    /**
     * Right Side Style
     */
    rightSideStyle: PropTypes.object,
    /**
     * Editable Right Side Style
     */
    editableTextStyle: PropTypes.object,

    /**
     * Individual item width.  Can be globally set in the parent.  Will become deprecated
     */
    itemWidth: PropTypes.number,
    /**
     * Allows for the item to become an auth item
     */
    isAuth: PropTypes.bool,
    authPropsUser: PropTypes.object,
    authPropsPW: PropTypes.object,
    /**
     * Individual background color. Can be globally set in the parent. Will become Deprecated
     */
    backgroundColor: PropTypes.string,

    /**
     * Individual underlay click color.  Can be globally set in the parent.
     */
    underlayColor: PropTypes.string,
    /**
     * Item on press callback.
     */
    onPress: PropTypes.func,
    /**
     * Item on long press callback.
     */
    onLongPress: PropTypes.func,
    /**
     * Enable or disable the > arrow at the end of the setting item.
     */
    hasNavArrow: PropTypes.bool,
    arrowIcon: PropTypes.node,

    arrowStyle: PropTypes.object,
    /**
     * Enable or disable a Switch component
     */
    hasSwitch: PropTypes.bool,
    /**
     * Switch state
     */
    switchState: PropTypes.bool,
    /**
     * Switch props
     */
    switchProps: PropTypes.object,
    /**
     * On value change callback
     */
    switchOnValueChange: PropTypes.func,
    /**
     * Right side information on the setting item
     */
    titleInfo: PropTypes.string,
    titleInfoStyle: PropTypes.object,
    /**
     * If 'Bottom', info is placed beneath the title
     */
    titleInfoPosition: PropTypes.string,
    /**
     * Right side content
     */
    rightSideContent: PropTypes.node,
    /* Gives opens to hide specific borders */
    borderHide: PropTypes.oneOf(['Top', 'Bottom', 'Both']),

    itemRef: PropTypes.func,
  },
  getDefaultProps(){
    return {
      hasNavArrow: true
    }
  },
  /**
   * not directly rendered
   */
  render(){
    return null;
  },
});
