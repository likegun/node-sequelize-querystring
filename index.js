'use strict'

const _ = require('lodash')

const defaultValue = (v) => v
const arrayValue = (v) => { return v.split('+').map(v => `{${v}}`) }
const likeValue = (v) => { return `%${v}%` }
const operators = {
  'and': { op: '$and', val: defaultValue },
  'or': { op: '$or', val: defaultValue },
  'gt': { op: '$gt', val: defaultValue },
  'gte': { op: '$gte', val: defaultValue },
  'lt': { op: '$lt', val: defaultValue },
  'lte': { op: '$lte', val: defaultValue },
  'ne': { op: '$ne', val: defaultValue },
  'eq': { op: '$eq', val: defaultValue },
  'not': { op: '$not', val: defaultValue },
  'between': { op: '$between', val: defaultValue },
  'notBetween': { op: '$notBetween', val: defaultValue },
  'in': { op: '$in', val: arrayValue },
  'notIn': { op: '$notIn', val: arrayValue },
  'like': { op: '$like', val: likeValue },
  'notLike': { op: '$notLike', val: likeValue },
  'iLike': { op: '$iLike', val: likeValue },
  'notILike': { op: '$notILike', val: likeValue },
  // under work
  // 'overlap': { op: 'array.$overlap', val: arrayValue },
  // 'contains': { op: 'array.$contains', val: arrayValue },
  // 'contained': { op: 'array.$contained', val: arrayValue },
  'any': { op: '$any', val: defaultValue }
}

/**
 * Converts the find query string attribute into a where clause
 *
 * @param {any} qs expression
 * @returns {object} where
 */
exports.find = (expression) => {
  // filter=geoId eq 111, properties.publicoId  eq 1231
  let where
  if (expression.match(/(([\w|.]+)\s(\w+)\s(\w+),?)+/)) {
    let parts = (expression).split(',')
    where = { }
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].match(/([\w|.]+)\s(\w+)\s([\w|+|.|:|-]+)/)) {
        let prop = RegExp.$1
        let op = RegExp.$2
        let value = RegExp.$3
        if (!operators[op]) {
          throw new Error(`Invalid operator ${op}`)
        }
        const operator = operators[op]
        _.set(where, `${prop}.${operator.op}`, operator.val(value))
      }
    }
  }

  if (where == null) {
    throw new Error(`Invalid expression ${expression}`)
  }

  return where
}

/**
 * Converts the query string attribute sort into an order by
 *
 * @param {any} qs expression
 * @returns {array} order clause
 */
exports.sort = (expression) => {
  // order=geoId desc
  let order = []
  let exp = expression.split(' ')
  if (exp.length === 2) {
    let prop = exp[0]
    let ord = exp[1].toUpperCase()
    if (ord.match(/ASC|DESC/i)) {
      order.push([prop, ord.toUpperCase()])
    }
  }
  if (order == null) {
    throw new Error('Invalid order expression')
  }

  return order
}
